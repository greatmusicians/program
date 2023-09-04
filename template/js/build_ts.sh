for f in $(ls ow_*.ts); do
	echo "build $f"
	tsc $f --target "es5" --lib "es2015,dom" --downlevelIteration
done
