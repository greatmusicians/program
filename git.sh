original_dir=$(pwd)

function push() {
    cd "$1"
    echo "==================== git push ===================="
    echo $(pwd)
    if [ -n "$(git status --porcelain)" ]; then
        git add .
        git add -u
        git commit -m "first commit"
        git push -u origin main
    else
        echo "no changes"
    fi
    cd "$original_dir"
}

function pull() {
    cd "$1"
    echo "==================== git pull ===================="
    echo $(pwd)
    git pull
    cd "$original_dir"
}

if [ "$1" = "pull" ];then
    pull ./Menschen    
    pull ./Menschen2
    pull ./program
    pull ./other
else
    push ./Menschen
    push ./Menschen2
    push ./program
    push ./other
fi
