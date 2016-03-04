var git = require('gitty');
var myRepo = git('./');

function reload() {
    myRepo.status(function (err, status) {
        var staged = status.staged.map(function (item) {
            return "{green-fg}" + item.file + "{/green-fg}";
        })
        var unstaged = status.unstaged.map(function (item) {
            return "{white-fg}" + item.file + "{/white-fg}";
        })
        var untracked = status.untracked.map(function (item) {
            return "{gray-fg}" + item + "{/gray-fg}";
        })

        var items = []
            .concat(["=== staged ==="])
            .concat(staged)
            .concat(["=== unstaged ==="])
            .concat(unstaged)
            .concat(["=== untracked ==="])
            .concat(untracked);
        list.setItems(items);
        screen.render();
    })
}

var blessed = require('blessed')
    , screen;

var auto = true;

screen = blessed.screen({
    autoPadding: auto,
    warnings: true
});

var list = blessed.list({
    parent: screen,
    align: 'left',
    mouse: true,
    keys: true,
    vi: true,
    width: '30%',
    height: 'shrink',
    border: 'line',
    tags: 'true',
    top: 0,
    left: 0,
    style: {
        fg: 'white',
        bg: 'default',
        selected: {
            bg: 'gray'
        }
    },
    items: []
});

list.select(0);

function removeTags(content) {
    if (!content) {
        return "";
    }
    return content.replace(/{[^}]+}/g, "");
}

list.on('select', function (item, index) {
    var itemname = removeTags(item.content);
    var statuses = {
        "NEW": "new file",
        "UPDATE": "modified"
    }
    var actions = {
        "NONE": 0,
        "REMOVE": 1,
        "STAGE": 2,
        "UNSTAGE": 3
    }

    function statusToAction(status) {
        var action = actions.NONE;
        if (status === statuses.NEW) {
            action = actions.REMOVE;
        }
        if (status === statuses.UPDATE) {
            action = actions.UNSTAGE;
        }
        return action;
    }

    var action = actions.NONE;
    myRepo.status(function (err, stat) {
        stat.staged.forEach(function (item) {
            if (item.file.toUpperCase() === itemname.toUpperCase()) {
                action = statusToAction(item.status);
            }
        })

        stat.unstaged.forEach(function (item) {
            if (item.file.toUpperCase() === itemname.toUpperCase()) {
                action = actions.STAGE;
            }
        })
        stat.untracked.forEach(function (item) {
            if (item.toUpperCase() === itemname.toUpperCase()) {
                action = actions.STAGE;
            }
        })
        if (action === actions.REMOVE) {
            myRepo.removeSync([itemname]);
        }
        if (action === actions.STAGE) {
            myRepo.addSync([itemname]);
        }
        if (action === actions.UNSTAGE) {
            myRepo.unstageSync([itemname]);
        }
        reload();
    })
});

screen.key('C-c', function () {
    clearInterval(interval);
    screen.destroy();
    
});

screen.key('q', function () {
    clearInterval(interval);
    return screen.destroy();
});

list.focus();
reload();

var topright = blessed.box({
    parent: screen,
    left: '30%-1',
    top: 0,
    width: '70%+1',
    height: '80%',
    border: 'line',
    content: 'Bar'
});

var interval = setInterval(function () {
    var selectedItem = list.getItem(list.selected).content;

    var fileName = removeTags(selectedItem);
    if(fileName.indexOf("=== ") === 0){
        return;
    }    
    myRepo.status(function (err, status) {
        var gity = require('gity')();
        gity.diff(fileName)
            .run(function (err, res) {
                topright.content = res;
                screen.render();
            })
    })
}, 1000);

screen.render();