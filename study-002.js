var git    = require('gitty');
var myRepo = git('./');
myRepo.status(function(err, status){
    console.log(status);
    myRepo.add(["doc/README.md"], function(err){
        console.log(err);
    });
    //myRepo.removeSync(["index.js"]);
    console.log("add!");
})

