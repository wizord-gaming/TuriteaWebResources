var home = $("#main");

function loadMainFragment() {
    let c = document.cookie;
    let homeDiv = $("#home");
    let first = c.indexOf("home");
    if (first < 0) {
        let fragment = $("#at404");
        fragment.show();
        homeDiv.hide();
        return
    }
    let end = c.substring(first, c.length).indexOf(";");
    let home = parseInt(c.substring(first + 5, end === -1 ? c.length : end));
    if (!home) {
        let fragment = $("#at404");
        fragment.show();
        homeDiv.hide();
        return
    }
    $.get('../api/fragment?id=' + home, function (r) {
        let f = JSON.parse(r);
        let content = f["content"];
        let res = f["res"];

        for (let i = 0; i < res.length; i++) {
            if (res[i]["type"] === "f") {
                eachFragment($("<div></div>"), res[i]["id"]);
            }
        }
        homeDiv.append($("<p></p>").append(content));
        homeDiv.append($("<span hidden></span>").text(r));
    }).fail(function () {
        let fragment = $("#at404");
        fragment.show();
        homeDiv.hide();
    });
}

function eachFragment(node, id) {
    $.get('../api/fragment?id=' + id, function (r) {
        let f = JSON.stringify(r);
        let content = f["content"];
        let res = f["res"];
        node.append($("<p></p>").append(content));
        node.append($("<span hidden></span>").text(r));
        home.append(node);
    });
}

var articleEditor;
var information = null;
var article = null;

function loadArticleNote() {
    articleEditor = $("#articleSummerNote");
    articleEditor.summernote({
        height: 500,
        codemirror: {
            theme: 'monokai'
        },
        placeholder: "feel free to edit"
    });
    article = JSON.parse(localStorage.getItem("editArticle"));
    if (article) {
        $("#articleTitle").text("edit article");
        articleEditor.summernote("code", article.content);
        $("#articleSum").val(article.sum);
        information = JSON.parse(article.home);
    }
}

function editArticle(self) {
    let div = $(self);
    let a = {};
    a.sum = $("#summary").text();
    a.content = div.children("p").html();
    a.home = div.children("span").text();
    a.id = $("#articleId").text();
    localStorage.setItem("editArticle", JSON.stringify(a));
    window.location.href = "../html/settings.html#tabs-3"
}

function submitArticle() {
    let delImage = [];
    if (information !== null) {
        let fid = information["id"];
        let res = information["res"];
        for (let i = 0; i < res.length; i++) {
            if (res[i]["type"] === "m") {
                delImage.push(res[i]["m"]["uid"].toString(16));
            }
        }

    }
    let combination = {};
    let code = articleEditor.summernote('code');
    let help = $("<p></p>").append($.parseHTML(code));

    let images = help.find("img");

    let datas = [];
    for (let i = 0; i < images.length; i++) {
        let image = images[i];
        let filName = image.dataset.filename;
        let img = $(image);
        let src = img.attr("src");
        if (src.startsWith("data:")) {
            datas.push({"image": src.split(",")[1], "title": filName});
            img.attr("src", "../api/getImage?id=%x");
        }
    }
    combination.images = JSON.stringify(datas);
    combination.imageNum = datas.length;
    combination.articles = JSON.stringify([{"sum": $("#articleSum").val()},]);
    combination.content = help.html();

    if (information !== null) {
        let id = article["id"];
        combination.aid = id;

        for (let i = 0; i < delImage.length; i++) {
            let imgId = delImage[i];
            if (combination.content.indexOf("../api/getImage?id=" + imgId) < 0) {
            }
        }
        $.post("../api/updateArticle", combination, function (r) {
            localStorage.setItem("editArticle", null);
            information = null;
            window.location.href = "../article/" + id;
        }).fail(function (r) {
        });
    } else {
        $.post("../api/addArticleWithImage", combination, function (r) {
            localStorage.setItem("editArticle", null);
            window.location.href = "../article/" + r;
        }).fail(function (r) {
            error("Not login or other error", "Please login thank you or check other things!");
        })
    }
}

function deleteArticle() {
    let id = $("#articleId").text();
    let fid = JSON.parse($("#home").children("span").html()).id;

    $.post("../api/delete?type=0&id=" + fid.toString(16), function () {
        $.post("../api/delete?type=4&id=" + id.toString(16), function () {
            window.location.href = "../html/articleList.html";
        }).fail(function () {
            error("Error", "delete part success<br/>please contact system management")
        });
    }).fail(function () {
        error("Error", "Login first");
    })
}
