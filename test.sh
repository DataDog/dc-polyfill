#!/usr/bin/env bash

echo "Node.js version: $(node --version)"

errors=0

for i in test/*.spec.js; do
	node "$i" || ((errors++))
done

if [ "$errors" -gt "0" ]; then
	echo "Encountered ${errors} test suite failures!"
fi

exit $errors
