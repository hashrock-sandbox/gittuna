var git    = require('gitty');
var myRepo = git('./');
myRepo.status(function(err, status){
    console.log(status);
    var gity = require('gity')();
    gity.diff('doc/README.md')
        .run(function(err, res){
            console.log(res);
        })
})

