for f in $(ls als_*.ts); do
	echo "compile $f"
	tsc $f --target "es5" --lib "es2015,dom" --downlevelIteration
done
