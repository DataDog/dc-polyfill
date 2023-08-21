echo "Node.js version: `node --version`"
for i in test/*.js;
  do node "$i";
done
