/* TEMPLATES: */
const newstemplate = {
    badge: function(type, color) {
        var style, cssstyle;
        if (typeof color != 'undefined') {
            style = color;
            cssstyle = `style="background: var(--bs-${color});"`
        } else {
            style = "info";
        };
        return `<span class="badge bg-${style}" ${cssstyle}>${type}</span>`;
    },
    card: function(json) {
        return `<div class="col-sm-6 mb-3" style="width: 18rem;">
        <div class="card">
            <img class="card-img-top" src="${json.img}" style="border-top-left-radius: calc(0.25rem - 1px); border-top-right-radius: calc(0.25rem - 1px);" alt="Card image cap ">
            <div class="card-body">
                <h5 class="card-title">${json.title}</h5>
                ${json.type}
                <p class="card-text">${json.desc}</p>
                <a href="${json.url}" role="button" class="btn btn-sm btn-darkpurple" target="_blank">${json.utype}</a>
            </div>
        </div>
    </div>`;
    }
};

/* MAIN: */
async function GetNewsJSON() {
    try {
        const res = await axios.get(`https://protoshock.ml/news/latest.json?timestamp=${new Date().getTime()}`);
        return res.data;
    } catch (e) {
        return "err";
    };
    //return res;
};

console.log("Fetching news json");

var newsjson, JSONReq, tempnews;

(async() => {
    $('#newsinfo').css("display", "block");
    JSONReq = await GetNewsJSON();

    if (JSONReq != "err" && JSONReq != "" && JSONReq != "undefined" && JSONReq != null) {
        newsjson = JSONReq;
        $('#newsinfo').css("display", "none");
        $("#newstitle").css("display", "block");
    } else {
        console.log("Error fetching json from server, exiting.");
        $('#newsinfo').css("display", "none");
        $("#newserror").css("display", "block");
        $('#newstitle').css("display", "none");
        return;
    };

    console.log("Generating cards");
    var count = 1;
    for (var i = 0; i < newsjson.length; i++) {
        //console.log(i);
        //console.log(newsjson[i]);
        newstemp = newsjson[i];
        newstemp.desc = newstemp.desc.replace(/(?:\r\n|\r|\n)/g, '<br>');
        if (newstemp.method != null && newstemp.method != "" && newstemp.method != "undefined") {
            newstemp.utype = newstemp.method;
        } else {
            newstemp.utype = "View update";
        };
        newstemp.type = newstemplate.badge(newstemp.type);
        newstemp.badge = newstemplate.badge(newstemp.date);
        card = newstemplate.card(newstemp);
        //console.log(card);
        $(`#news-cards`).append(card);

        if (count == 3) {
            break;
        } else {
            count++;
        };
    };
})();