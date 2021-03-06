var pins;

//fills the icon selection screen
function addIconOptions(element) {
    Options = ['airfield', 'airport', 'alcohol-shop', 'america-football', 'art-gallery', 'bakery', 'bank', 'bar', 'baseball', 'basketball', 'beer', 'bicycle', 'building', 'bus', 'cafe', 'camera', 'campsite', 'car', 'cemetery', 'cesium', 'chemist', 'cinema', 'circle', 'circle-stroked', 'city', 'clothing-store', 'college', 'commercial', 'cricket', 'cross', 'dam', 'danger', 'disability', 'dog-park', 'embassy', 'emergency-telephone', 'entrance', 'farm', 'fast-food', 'ferry', 'fire-station', 'fuel', 'garden', 'gift', 'golf', 'grocery', 'hairdresser', 'harbor', 'heart', 'heliport', 'hospital', 'ice-cream', 'industrial', 'land-use', 'laundry', 'library', 'lighthouse', 'lodging', 'logging', 'london-underground', 'marker', 'marker-stroked', 'minefield', 'mobilephone', 'monument', 'museum', 'music', 'oil-well', 'park2', 'parking-garage', 'parking', 'park', 'pharmacy', 'pitch', 'place-of-worship', 'playground', 'police', 'polling-place', 'post', 'prison', 'rail-above', 'rail-light', 'rail-metro', 'rail', 'rail-underground', 'religious-christian', 'religious-jewish', 'religious-muslim', 'restaurant', 'roadblock', 'rocket', 'school', 'scooter', 'shop', 'skiing', 'slaughterhouse', 'soccer', 'square', 'square-stroked', 'star', 'star-stroked', 'suitcase', 'swimming', 'telephone', 'tennis', 'theatre', 'toilets', 'town-hall', 'town', 'triangle', 'triangle-stroked', 'village', 'warehouse', 'waste-basket', 'water', 'wetland', 'zoo']

    var html = "";

    for (var s in Options) {
        let line = '<option value=' + Options[s] + '>' + Options[s] + '</option>';
        html += line;
    }
    $("#" + element).html(html);
}

//compiles pin data one object
function getallData() {
    let pin = {};
    let n = $('#summerNotePin');
    if (n.length !== 0) {
        pin["name"] = document.getElementById("nameAd").value;
        pin["tag_type"] = document.getElementById("iconSelectAd").value;
        pin["lon"] = parseFloat($("#longTextAd")[0].value);
        pin["lat"] = parseFloat($("#latTextAd")[0].value);
        pin["color"] = document.getElementById("colorSelectorsAd").value;
        pin["uid"] = parseInt($("#pinIdAd")[0].value);
    } else {
        pin["name"] = document.getElementById("name").value;
        pin["tag_type"] = document.getElementById("iconSelect").value;
        pin["lon"] = parseFloat($("#longText")[0].value);
        pin["lat"] = parseFloat($("#latText")[0].value);
        pin["color"] = document.getElementById("colorSelectors").value;
        pin["uid"] = parseInt($("#pinId")[0].value);
        pin["description"] = $("#description")[0].value;
    }
    pin["time"] = 18711;
    return pin;
}

function deletePin() {
    let pin = $(".cesium-infoBox-iframe")[0].contentDocument.getElementById("inDescription");
    if (pin === null) {
        error("Error Message", "Sorry, you have not selected a pin. Please try again.");
    }
    let id = pin.innerText;

    $.get("../api/delete?type=2&id=" + id, function (result) {
        viewer.entities.removeById(id);
    }).fail(function (xhr) {
        error("Error Message", "Sorry, something went wrong. Please try again.");
    });
}

function submitPin() {
    if (temPin === null) {
        let pin = getallData();
        let pins = {};
        pins.data = "[" + JSON.stringify(pin) + "]";
        pins.num = 1;
        $.post("../api/update?type=2", pins, function () {
            let p = $("#pin-dialog");
            if (p.length !== 0) {
                p.dialog('close');
            }
            temPin = null;
            loadpins(reloadCondition);
        }).fail(function (r) {
            error("Error Message", "Sorry, something went wrong. Please try again.");
        });
    } else {
        let pin = getallData();
        let pins = {};
        pins.data = '[' + JSON.stringify(pin) + ']';
        $.post("../api/addPins?num=1", pins, function () {
            temPin = null;
            viewer.entities.removeById("tem");
            $('#lon').text(0.0);
            $('#lat').text(0.0);
            loadpins(reloadCondition);
        }).fail(function (r) {
            error("Error Message", "Sorry, something went wrong. Please try again.");
        });
        let p = $("#pin-dialog");
        if (p.length !== 0) {
            p.dialog('close');
        }
    }
}

function toAdvancePins() {
    localStorage.setItem("editPin", JSON.stringify(getallData()));
    if (temPin !== null) {
        localStorage.setItem("mode", "add");
    } else {
        localStorage.setItem("mode", "update")
    }
    window.location.href = "../html/settings.html#tabs-1";
}

function submitPinAd() {
    let combination = {};
    let pin = getallData();
    let pinId = null;
    let code = editor.summernote('code');
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
    combination.pins = JSON.stringify([pin,]);
    combination.articles = JSON.stringify([{"sum": "pin name:" + pin.name + " at longitude: " + pin.lon.toString().substring(0, 7) + ", latitude: " + pin.lat.toString().substring(0, 7)},]);
    combination.content = help.html();
    $.post("../api/addPinWithArticle", combination, function (r) {
        localStorage.setItem("editPin", null);
        localStorage.setItem("viewerMiddle", JSON.stringify({lat: pin["lat"], lon: pin["lon"]}));
        window.location.href = "../html/home.html";
    }).fail(function (r) {
        error("Error Message", "Sorry, something went wrong. Please try again.");
    })
}
