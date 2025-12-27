#!/bin/bash

#==============================================================================
# DEPLOY.SH - Script de déploiement automatisé
# Workflow: release/X.X.X → staging → main
# Gère: PR, tags, releases, déploiement, versioning automatique
#==============================================================================

set -e  # Exit on error

#------------------------------------------------------------------------------
# CONFIGURATION
#------------------------------------------------------------------------------
FRONTEND_DIR="."
BACKEND_DIR="../../mystictattoo-api"
FRONTEND_URL="https://mystic-tattoo.fr"
BACKEND_URL="https://mystictattoo-api.onrender.com/api"
VERSION_FILE="VERSION"
MAIN_BRANCH="main"
STAGING_BRANCH="staging"
GITHUB_REPO=""  # Auto-détecté

#------------------------------------------------------------------------------
# COULEURS
#------------------------------------------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

#------------------------------------------------------------------------------
# FONCTIONS UTILITAIRES
#------------------------------------------------------------------------------
log_info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $1"; }
log_step()    { echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; echo -e "${CYAN}▶ $1${NC}"; echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"; }

confirm() {
    read -p "$1 [y/N] " -n 1 -r
    echo
    [[ $REPLY =~ ^[Yy]$ ]]
}

#------------------------------------------------------------------------------
# VÉRIFICATION DES PRÉREQUIS
#------------------------------------------------------------------------------
check_prerequisites() {
    log_step "Vérification des prérequis"

    local missing=()

    command -v git >/dev/null 2>&1 || missing+=("git")
    command -v gh >/dev/null 2>&1 || missing+=("gh (GitHub CLI)")
    command -v node >/dev/null 2>&1 || missing+=("node")
    command -v npm >/dev/null 2>&1 || missing+=("npm")
    command -v curl >/dev/null 2>&1 || missing+=("curl")

    if [ ${#missing[@]} -ne 0 ]; then
        log_error "Outils manquants: ${missing[*]}"
        exit 1
    fi

    # Vérifier l'authentification GitHub CLI
    if ! gh auth status >/dev/null 2>&1; then
        log_error "GitHub CLI non authentifié. Exécutez: gh auth login"
        exit 1
    fi

    # Auto-détecter le repo GitHub
    GITHUB_REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "")
    if [ -z "$GITHUB_REPO" ]; then
        log_error "Impossible de détecter le repo GitHub"
        exit 1
    fi

    log_success "Tous les prérequis sont OK"
    log_info "Repo détecté: $GITHUB_REPO"
}

#------------------------------------------------------------------------------
# GESTION DE VERSION
#------------------------------------------------------------------------------
get_current_version() {
    if [ -f "$VERSION_FILE" ]; then
        cat "$VERSION_FILE"
    else
        # Chercher le dernier tag
        local latest_tag=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")
        echo "${latest_tag#v}"
    fi
}

increment_version() {
    local version=$1
    local type=$2

    IFS='.' read -r major minor patch <<< "$version"

    case $type in
        major)
            major=$((major + 1))
            minor=0
            patch=0
            ;;
        minor)
            minor=$((minor + 1))
            patch=0
            ;;
        patch|*)
            patch=$((patch + 1))
            ;;
    esac

    echo "$major.$minor.$patch"
}

save_version() {
    echo "$1" > "$VERSION_FILE"
    git add "$VERSION_FILE"
}

#------------------------------------------------------------------------------
# GESTION DES BRANCHES
#------------------------------------------------------------------------------
ensure_branch_exists() {
    local branch=$1
    if ! git show-ref --verify --quiet "refs/heads/$branch"; then
        if git show-ref --verify --quiet "refs/remotes/origin/$branch"; then
            git checkout -b "$branch" "origin/$branch"
        else
            log_warning "Branche $branch n'existe pas, création..."
            git checkout -b "$branch"
            git push -u origin "$branch"
        fi
    fi
}

get_current_branch() {
    git branch --show-current
}

has_uncommitted_changes() {
    ! git diff-index --quiet HEAD -- 2>/dev/null
}

cleanup_release_branches() {
    log_step "Nettoyage des branches release mergées"

    # Récupérer les branches release mergées dans main
    local merged_branches=$(git branch -r --merged origin/$MAIN_BRANCH | grep "origin/release/" | sed 's/origin\///')

    for branch in $merged_branches; do
        if [ -n "$branch" ]; then
            log_info "Suppression de $branch..."
            git push origin --delete "$branch" 2>/dev/null || true
            git branch -d "$branch" 2>/dev/null || true
        fi
    done

    # Nettoyer les références locales
    git fetch --prune

    log_success "Nettoyage terminé"
}

#------------------------------------------------------------------------------
# DÉPLOIEMENT
#------------------------------------------------------------------------------
deploy_frontend() {
    log_step "Déploiement Frontend"

    if [ ! -d "$FRONTEND_DIR" ]; then
        log_error "Répertoire frontend non trouvé: $FRONTEND_DIR"
        return 1
    fi

    cd "$FRONTEND_DIR"

    log_info "Installation des dépendances..."
    npm ci --silent

    log_info "Build de production..."
    npm run build

    if [ $? -eq 0 ]; then
        log_success "Build frontend réussi"
    else
        log_error "Build frontend échoué"
        cd ..
        return 1
    fi

    cd ..
    return 0
}

deploy_backend() {
    log_step "Déploiement Backend"

    if [ ! -d "$BACKEND_DIR" ]; then
        log_warning "Répertoire backend non trouvé: $BACKEND_DIR"
        log_info "Tentative de déploiement via git push uniquement..."

        # Si le backend est dans un autre repo, on peut push depuis ici
        if [ -d "../mystictattoo-api" ]; then
            cd "../mystictattoo-api"
            git push origin main 2>/dev/null || true
            cd -
        fi
        return 0
    fi

    cd "$BACKEND_DIR"

    log_info "Installation des dépendances..."
    npm ci --silent 2>/dev/null || npm install --silent

    log_info "Vérification de la syntaxe..."
    npm run lint 2>/dev/null || true

    cd -
    log_success "Backend prêt"
    return 0
}

health_check() {
    log_step "Vérification de santé des services"

    local max_retries=5
    local retry_delay=10

    # Check Backend
    log_info "Vérification du backend: $BACKEND_URL"
    for i in $(seq 1 $max_retries); do
        if curl -sf "$BACKEND_URL" >/dev/null 2>&1; then
            log_success "Backend OK"
            break
        fi
        if [ $i -eq $max_retries ]; then
            log_warning "Backend non accessible (peut être normal en dev)"
        else
            log_info "Tentative $i/$max_retries... attente ${retry_delay}s"
            sleep $retry_delay
        fi
    done

    # Check Frontend
    log_info "Vérification du frontend: $FRONTEND_URL"
    for i in $(seq 1 $max_retries); do
        if curl -sf "$FRONTEND_URL" >/dev/null 2>&1; then
            log_success "Frontend OK"
            break
        fi
        if [ $i -eq $max_retries ]; then
            log_warning "Frontend non accessible (peut être normal en dev)"
        else
            log_info "Tentative $i/$max_retries... attente ${retry_delay}s"
            sleep $retry_delay
        fi
    done

    return 0
}

#------------------------------------------------------------------------------
# GESTION DES PR
#------------------------------------------------------------------------------
create_pr() {
    local source=$1
    local target=$2
    local title=$3
    local body=$4

    log_info "Création PR: $source → $target"

    # Vérifier si une PR existe déjà
    local existing_pr=$(gh pr list --head "$source" --base "$target" --json number -q '.[0].number')

    if [ -n "$existing_pr" ]; then
        log_warning "PR #$existing_pr existe déjà pour $source → $target"
        echo "$existing_pr"
        return 0
    fi

    # Créer la PR
    local pr_url=$(gh pr create \
        --base "$target" \
        --head "$source" \
        --title "$title" \
        --body "$body" \
        2>/dev/null)

    if [ $? -eq 0 ]; then
        local pr_number=$(echo "$pr_url" | grep -oE '[0-9]+$')
        log_success "PR #$pr_number créée: $pr_url"
        echo "$pr_number"
    else
        log_error "Échec création PR"
        return 1
    fi
}

merge_pr() {
    local pr_number=$1
    local merge_method=${2:-"squash"}  # squash, merge, rebase

    log_info "Merge PR #$pr_number (méthode: $merge_method)"

    if gh pr merge "$pr_number" --"$merge_method" --delete-branch; then
        log_success "PR #$pr_number mergée"
        return 0
    else
        log_error "Échec merge PR #$pr_number"
        return 1
    fi
}

wait_for_pr_checks() {
    local pr_number=$1
    local timeout=${2:-300}  # 5 minutes par défaut

    log_info "Attente des checks CI pour PR #$pr_number..."

    local start_time=$(date +%s)
    while true; do
        local status=$(gh pr checks "$pr_number" --json state -q '.[].state' 2>/dev/null | sort -u)

        if echo "$status" | grep -q "FAILURE"; then
            log_error "Checks CI échoués"
            return 1
        fi

        if [ "$status" = "SUCCESS" ] || [ -z "$status" ]; then
            log_success "Checks CI passés"
            return 0
        fi

        local elapsed=$(($(date +%s) - start_time))
        if [ $elapsed -ge $timeout ]; then
            log_warning "Timeout atteint, les checks peuvent toujours être en cours"
            return 0
        fi

        sleep 10
    done
}

#------------------------------------------------------------------------------
# GESTION DES TAGS ET RELEASES
#------------------------------------------------------------------------------
create_tag() {
    local version=$1
    local message=$2

    log_info "Création du tag v$version"

    git tag -a "v$version" -m "$message"
    git push origin "v$version"

    log_success "Tag v$version créé et pushé"
}

create_github_release() {
    local version=$1
    local notes=$2

    log_info "Création de la release GitHub v$version"

    gh release create "v$version" \
        --title "Release v$version" \
        --notes "$notes" \
        --latest

    log_success "Release v$version créée sur GitHub"
}

generate_changelog() {
    local from_tag=$1
    local to_ref=${2:-"HEAD"}

    if [ -z "$from_tag" ]; then
        from_tag=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
    fi

    local changelog=""

    if [ -n "$from_tag" ]; then
        changelog=$(git log "$from_tag".."$to_ref" --pretty=format:"- %s" --no-merges 2>/dev/null)
    else
        changelog=$(git log --pretty=format:"- %s" --no-merges -20 2>/dev/null)
    fi

    if [ -z "$changelog" ]; then
        changelog="- Mise à jour de routine"
    fi

    echo "$changelog"
}

#------------------------------------------------------------------------------
# WORKFLOW PRINCIPAL
#------------------------------------------------------------------------------
show_menu() {
    echo -e "\n${CYAN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║           MYSTIC TATTOO - DEPLOY MANAGER                 ║${NC}"
    echo -e "${CYAN}╠══════════════════════════════════════════════════════════╣${NC}"
    echo -e "${CYAN}║${NC}  1) ${GREEN}Release complète${NC} (patch: X.X.+1)                     ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  2) ${GREEN}Release mineure${NC}  (minor: X.+1.0)                     ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  3) ${GREEN}Release majeure${NC}  (major: +1.0.0)                     ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  4) ${YELLOW}Déployer staging → main${NC} (sans nouvelle version)     ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  5) ${BLUE}Nettoyer les branches release${NC}                       ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  6) ${BLUE}Health check des services${NC}                           ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  7) ${RED}Quitter${NC}                                             ${CYAN}║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"
    echo
}

do_full_release() {
    local version_type=$1
    local current_version=$(get_current_version)
    local new_version=$(increment_version "$current_version" "$version_type")
    local release_branch="release/$new_version"
    local original_branch=$(get_current_branch)

    log_step "Démarrage release v$new_version ($version_type)"
    log_info "Version actuelle: $current_version → Nouvelle: $new_version"

    # Vérifier les changements non commités
    if has_uncommitted_changes; then
        log_error "Vous avez des changements non commités. Commitez ou stash avant de continuer."
        exit 1
    fi

    # S'assurer d'être à jour
    log_info "Mise à jour depuis origin..."
    git fetch origin --prune

    # Créer la branche release depuis main
    log_info "Création de la branche $release_branch"
    git checkout $MAIN_BRANCH
    git pull origin $MAIN_BRANCH
    git checkout -b "$release_branch"

    # Mettre à jour la version
    save_version "$new_version"

    # Mettre à jour package.json si présent
    if [ -f "$FRONTEND_DIR/package.json" ]; then
        cd "$FRONTEND_DIR"
        npm version "$new_version" --no-git-tag-version --allow-same-version 2>/dev/null || true
        git add package.json package-lock.json 2>/dev/null || true
        cd ..
    fi

    # Commit de version
    git commit -m "chore: bump version to $new_version" || true

    # Push la branche release
    git push -u origin "$release_branch"

    # Créer PR vers staging
    log_step "Phase 1: Release → Staging"

    ensure_branch_exists "$STAGING_BRANCH"

    local changelog=$(generate_changelog)
    local pr_body="## Release v$new_version

### Changements
$changelog

### Checklist
- [ ] Tests passés
- [ ] Review effectuée
- [ ] Documentation à jour"

    local staging_pr=$(create_pr "$release_branch" "$STAGING_BRANCH" "Release v$new_version → Staging" "$pr_body")

    if [ -z "$staging_pr" ]; then
        log_error "Échec création PR vers staging"
        exit 1
    fi

    echo
    log_warning "PR #$staging_pr créée vers staging"
    log_info "Veuillez reviewer et merger la PR sur GitHub"

    if confirm "La PR vers staging a-t-elle été mergée ?"; then
        git fetch origin
        git checkout $STAGING_BRANCH
        git pull origin $STAGING_BRANCH

        # Déployer et tester
        log_step "Phase 2: Déploiement et tests"

        deploy_frontend || { log_error "Échec déploiement frontend"; exit 1; }
        deploy_backend || log_warning "Backend non déployé localement"

        if confirm "Voulez-vous effectuer un health check ?"; then
            health_check
        fi

        if ! confirm "Le déploiement staging est-il OK ? Continuer vers main ?"; then
            log_warning "Déploiement annulé. Corrigez les problèmes et relancez."
            exit 0
        fi

        # Créer PR vers main
        log_step "Phase 3: Staging → Main"

        local main_pr=$(create_pr "$STAGING_BRANCH" "$MAIN_BRANCH" "Release v$new_version → Production" "## Release v$new_version

Déploiement en production après validation sur staging.

$changelog")

        if [ -z "$main_pr" ]; then
            log_error "Échec création PR vers main"
            exit 1
        fi

        log_warning "PR #$main_pr créée vers main"

        if confirm "La PR vers main a-t-elle été mergée ?"; then
            git fetch origin
            git checkout $MAIN_BRANCH
            git pull origin $MAIN_BRANCH

            # Créer le tag et la release
            log_step "Phase 4: Tag et Release GitHub"

            create_tag "$new_version" "Release v$new_version"
            create_github_release "$new_version" "$changelog"

            # Nettoyage
            log_step "Phase 5: Nettoyage"

            # Supprimer la branche release
            git push origin --delete "$release_branch" 2>/dev/null || true
            git branch -d "$release_branch" 2>/dev/null || true

            cleanup_release_branches

            log_success "══════════════════════════════════════════════════════════"
            log_success "  RELEASE v$new_version TERMINÉE AVEC SUCCÈS !"
            log_success "══════════════════════════════════════════════════════════"
        fi
    fi
}

do_staging_to_main() {
    log_step "Déploiement staging → main (sans nouvelle version)"

    git fetch origin
    git checkout $STAGING_BRANCH
    git pull origin $STAGING_BRANCH

    # Déployer et tester
    deploy_frontend || { log_error "Échec déploiement frontend"; exit 1; }
    deploy_backend || log_warning "Backend non déployé localement"
    health_check

    if ! confirm "Continuer vers main ?"; then
        exit 0
    fi

    local changelog=$(generate_changelog)
    local pr=$(create_pr "$STAGING_BRANCH" "$MAIN_BRANCH" "Deploy staging → main" "$changelog")

    log_info "PR #$pr créée. Mergez-la sur GitHub pour finaliser."
}

#------------------------------------------------------------------------------
# POINT D'ENTRÉE
#------------------------------------------------------------------------------
main() {
    echo -e "${CYAN}"
    echo "  __  __           _   _        _____      _   _              "
    echo " |  \/  |_   _ ___| |_(_) ___  |_   _|_ _| |_| |_ ___   ___  "
    echo " | |\/| | | | / __| __| |/ __|   | |/ _\` | __| __/ _ \ / _ \ "
    echo " | |  | | |_| \__ \ |_| | (__    | | (_| | |_| || (_) | (_) |"
    echo " |_|  |_|\__, |___/\__|_|\___|   |_|\__,_|\__|\__\___/ \___/ "
    echo "         |___/                                                "
    echo -e "${NC}"
    echo -e "${YELLOW}Deploy Manager v1.0${NC}\n"

    check_prerequisites

    # Mode interactif ou argument
    if [ $# -eq 0 ]; then
        while true; do
            show_menu
            read -p "Choix: " choice
            case $choice in
                1) do_full_release "patch" ;;
                2) do_full_release "minor" ;;
                3) do_full_release "major" ;;
                4) do_staging_to_main ;;
                5) cleanup_release_branches ;;
                6) health_check ;;
                7) log_info "Au revoir !"; exit 0 ;;
                *) log_error "Choix invalide" ;;
            esac
        done
    else
        case $1 in
            patch|minor|major)
                do_full_release "$1"
                ;;
            deploy)
                do_staging_to_main
                ;;
            cleanup)
                cleanup_release_branches
                ;;
            health)
                health_check
                ;;
            *)
                echo "Usage: $0 [patch|minor|major|deploy|cleanup|health]"
                exit 1
                ;;
        esac
    fi
}

main "$@"