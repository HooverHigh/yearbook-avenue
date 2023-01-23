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
        return `<div class="col-sm-6 mb-1" style="width: 18rem;">
        <div class="card">
          <img class="card-img-top" src="${json.img}" onerror="imgError(this);" style="border-top-left-radius: calc(1.5rem - 1px); border-top-right-radius: calc(1.5rem - 1px); background-color: #475252;" alt="Card image cap ">
          <div class="card-body">
            <h5 class="card-title">${json.title}</h5>
            ${json.type}
            <p class="card-text">${json.desc}</p>
            <div class="btn-group" role="group" aria-label="Basic example">
              <a href="${json.url}" role="button" class="btn btn-sm btn-purple" target="_blank">${json.utype}</a>
              <a href="${json.url}" role="button" class="btn btn-sm btn-dark" target="_blank">Home page</a>
            </div>
          </div>
        </div>
    </div>`;
    }
};    

//var statuselement = `<div id="${name}" class="status offline" data-bs-toggle="tooltip" data-bs-placement="top" title="Discord status"></div>`;
//var statusscript = `/* Get Status */ DiscordStatus({userId: "${discordid}", statElmId: "${name}", socket: true});`;

/* MAIN: */
async function GetAppsJSON() {
    try {
        const res = await axios.get(`https://raw.githubusercontent.com/IsaacMvmv/N/metainfo/applist.json?timestamp=${new Date().getTime()}`);
        return res.data;
    } catch (e) {
        return "err";
    };
    //return res;
};

console.log("Fetching applist json");

var applistjson, JSONReq, tempnews;

(async() => {
    $('#newsinfo').css("display", "block");
    JSONReq = await GetAppsJSON();

    if (JSONReq != "err" && JSONReq != "" && JSONReq != "undefined" && JSONReq != null) {
        applistjson = JSONReq;
        $('#newsinfo').css("display", "none");
        $("#newstitle").css("display", "block");
    } else {
        console.log("Error fetching json from server, exiting.");
        $('#newsinfo').css("display", "none");
        $("#newserror").css("display", "block");
        $('#newstitle').css("display", "none");
        return;
    };

    function createElementFromHTML(htmlString) {
        var div = document.createElement('div');
        div.innerHTML = htmlString.trim();
        // Change this to div.childNodes to support multiple top-level nodes.
        return div.firstChild;
    };

    console.log("Generating cards");
    var count = 1;
    var aliel = document.createElement("div");
    //console.log(applistjson.length);
    try {
      for (var i = 0; i < applistjson.length; i++) {
        //console.log(i);
        console.log(applistjson[i]);
        let res = await axios.get(`https://raw.githubusercontent.com/IsaacMvmv/N/metainfo/meta/${applistjson[i]}.json?ts=${new Date().getTime()}`);
        apptemp = res.data;
        if (apptemp.method != null && apptemp.method != "" && apptemp.method != "undefined") {
            apptemp.utype = apptemp.method;
        } else {
            apptemp.utype = "View";
        };
        apptemp.img = `https://raw.githubusercontent.com/IsaacMvmv/N/metainfo/icons/${apptemp.img}`;
        apptemp.type = newstemplate.badge(apptemp.type);
        apptemp.badge = newstemplate.badge(apptemp.date);
        card = newstemplate.card(apptemp);
        //console.log(card);
        //console.log(apptemp);
        
        $(`#news-cards`).append(card);
        aliel.append(createElementFromHTML(card));

        if (count == 3) {
            //console.log(aliel);
            //document.getElementById(`news-cards`).appendChild(aliel);
            count = 1;
        } else {
            count++;
        };
      };
    } catch (e) {
        //console.log(e);
        if (debug == true) {
          iziToast.show({
            id: 'n-app-err',
            theme: 'dark',
            title: `Failed to download ${applistjson[i]} metainfo`,
            displayMode: 2,
            message: `${e}`,
            position: 'center',
            transitionIn: 'flipInX',
            transitionOut: 'flipOutX',
            progressBarColor: 'rgb(0, 255, 184)',
            image: './img/icons/error.png',
            imageWidth: 70,
            layout: 2,
            onClosed: function(instance, toast, closedBy) {
                console.log("Closedby: " + closedBy);
            }
          });
        }
        //alert("Unable to show some apps");
    };
})();