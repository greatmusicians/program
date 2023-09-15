function push() {
    original_dir=$1
    repo_dir=$2
    cd $repo_dir
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
    cd $original_dir
}

function pull() {
    original_dir=$1
    repo_dir=$2
    cd $repo_dir
    echo "==================== git pull ===================="
    echo $(pwd)
    git pull
    cd $original_dir
}

original_dir=$(pwd)
case $1 in
pull)
    pull $original_dir ./Menschen
    pull $original_dir ./Menschen2
    pull $original_dir ./program
    pull $original_dir ./other
    ;;
push)
    push $original_dir ./Menschen
    push $original_dir ./Menschen2
    push $original_dir ./program
    push $original_dir ./other
    ;;
*)
    push $original_dir ./Menschen
    push $original_dir ./Menschen2
    push $original_dir ./program
    push $original_dir ./other
    ;;
esac
