document.addEventListener("DOMContentLoaded", function() {
    window.obj = getJSON('http://localhost:5000/tree');
    initMainFolder(window.obj);
    initRightSide(window.obj);
    console.log(window.obj);
});

function getJSON(url) {
    var resp ;
    var xmlHttp ;

    resp  = '' ;
    xmlHttp = new XMLHttpRequest();

    if(xmlHttp != null)
    {
        xmlHttp.open( "GET", url, false );
        xmlHttp.send( null );
        resp = xmlHttp.responseText;
        var jsonObj = JSON.parse(resp);
    }

    return  jsonObj;
}

function initRightSide(json){
    var tbody = document.getElementById('content').getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';

    var trMain = document.createElement('tr');
    trMain.dataset.name = json.name;
    trMain.innerHTML = '<td>..</td><td></td><td></td>';
    trMain.className = 'folder';
    trMain.ondblclick = openFolder;
    tbody.appendChild(trMain);

    if (json.children.length > 0){
        for (var i = 0; i < json.children.length; i++){
            var tr = document.createElement('tr'),
                name = document.createElement('td'),
                date = document.createElement('td'),
                size = document.createElement('td');
            name.innerHTML = json.children[i].name;
            tr.appendChild(name);
            if (typeof json.children[i].children == 'undefined' || json.children[i].children.length == 0) {
                date.innerHTML = convertDate(json.children[i].birthTime);
                size.innerHTML = json.children[i].size + ' KB';
            } else {
                date.innerHTML = '';
                size.innerHTML = '';
                name.className = 'folder';
                tr.dataset.name = json.children[i].name;
                tr.ondblclick = openFolder;
            }

            tr.appendChild(date);
            tr.appendChild(size);

            tbody.appendChild(tr);
        }
    }
}

function initMainFolder(json){
    var main = document.createElement('ul');
    var liMain = document.createElement('li');
    liMain.innerHTML = json.name;
    liMain.className = 'item';
    main.dataset.name = json.name;

    if (json.children.length > 0) {
        var list = document.createElement('ul');
        list.dataset.name = json.name;

        for (var i = 0; i < json.children.length; i++ ){
            list.appendChild(contentsFolder(json.children[i]));
        }
        liMain.className += ' hasChild open';
        liMain.onclick = showOrHideFolder;
        liMain.appendChild(list);
    }
    main.appendChild(liMain);
    document.getElementById('tree').appendChild(main);
}

function contentsFolder(child){
    var li = document.createElement("li");
    li.innerHTML = child.name;
    li.className = 'item';

    if (typeof child.children != 'undefined'){
        li.className += ' hasChild';
        li.onclick = showOrHideFolder;
        var ul = document.createElement('ul');
        ul.dataset.name = child.name;

        for (var i = 0; i < child.children.length; i++ ){
            ul.appendChild(contentsFolder(child.children[i]));
        }
        li.appendChild(ul);

    } else {
        li.className += ' file';
        var regex1 = new RegExp(/\.(gif|jpg|jpeg|tiff|png)$/i);
        var regex2= new RegExp(/\.(doc|txt|pdf)$/i);
        var regex3= new RegExp(/\.(avi|mov|mp4|mpg)$/i);
        var regex4= new RegExp(/\.(mp3|wma|wav)$/i);

        if (regex1.test(child.name)) {
            li.className += ' img';
        } else if (regex2.test(child.name)) {
            li.className += ' txt';
        } else if (regex3.test(child.name)) {
            li.className += ' video';
        } else if (regex4.test(child.name)){
            li.className += ' audio';
        }
    }

    return li;
}

function showOrHideFolder(event){
    if (this.classList.contains('open')) {
        var classes = this.className.split(' ');
        for (var i = 0; i < classes.length; i++) {
            if (classes[i] == 'open')
                delete classes[i];
        }
        this.className = classes.join(' ');
    } else {
        this.className += ' open';

    }
    var parent = this.getElementsByTagName('ul')[0].dataset.name;
    searchItem(window.obj, parent);
    event.stopPropagation();
}

function openFolder(){
    var parent = this.dataset.name;
    searchItem(window.obj, parent);
}

function searchItem(json, parent){
    json.children.forEach(function(value, index){
        if (value.name == parent){
            initRightSide(value);
        } else if (typeof value.children != 'undefined'){
            searchItem(value, parent);
        }
    });
}

function convertDate(input) {
    function pad(s) { return (s < 10) ? '0' + s : s; }
    var d = new Date(input);
    return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('.') + ' ' + [pad(d.getHours()), pad(d.getMinutes())].join(':');
}
