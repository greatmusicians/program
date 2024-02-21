original_dir=$(pwd)

function push() {
    cd "$1"
    echo "==================== git push ===================="
    echo $(pwd)
    git add .
    git add -u
    git commit -m "first commit"
    git push -u origin main
    #if [ -n "$(git status --porcelain)" ]; then
    #else
    #    echo "no changes"
    #fi
    cd "$original_dir"
}

function pull() {
    cd "$1"
    echo "==================== git pull ===================="
    echo $(pwd)
    git pull
    cd "$original_dir"
}

if [ "$1" = "pull" ]; then
    pull ./Menschen
    pull ./Menschen_Berufstrainer
    pull ./Aspekte_B1.2
    pull ./Sprechen
    pull ./program
    pull ./other
else
    push ./Menschen
    push ./Menschen_Berufstrainer
    push ./Aspekte_B1.2
    push ./Sprechen
    push ./program
    push ./other
fi
