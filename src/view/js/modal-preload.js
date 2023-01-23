console.log("init");
window.addEventListener('load', function() {
    console.log("DOM Loaded");

    /*if (document.getElementsByTagName("button")[0].innerHTML = "LOGOUT") {
        document.getElementsByTagName("button")[0].click();
    };*/

    /* Detect Launcher */
    var plaunch = new WebSocket("ws://localhost:4756");
    plaunch.onmessage = function(s) {
        //console.log(s);
        if (typeof s == "object") {
            if (s.data == "connected!") return;
            var json = s;
            console.log(json.data);
            console.log(JSON.parse(json.data));
            var disc = JSON.parse(json.data);
            if (disc.IsValid == true) {
                //alert("Detected ProtoShock Launcher");

                if (document.getElementById("discdata") != null) {
                    /*If launcher is detected, return to launcher discorddata:*/
                    if (window.location.href == "https://protoshockml/discord/launcher-oauth.php") {
                        /*Store discord data as json:*/
                        var dsicordjsondata;
                        discordjsondata = document.getElementById("discdata").innerHTML;
                    };
                    alert(`prshockl://oauth/login?data=${discordjsondata}`);
                    window.open(`prshockl://oauth/login?data=${discordjsondata}`);
                } else {
                    /*Auto logout user if they are already logged in to gain new data, else auto click login:*/
                    if (document.getElementsByTagName("button")[0].innerHTML = "LOGOUT") {
                        document.getElementsByTagName("button")[0].click();
                    } else {
                        document.getElementsByTagName("button")[0].click();
                    };
                    /*Sometimes button is bugged, so click it twice:*/
                    document.getElementsByTagName('button')[0].click();
                };
            } else {
                alert("Unable to detect ProtoshockLauncher!");
                window.close();
            };
        } else {
            alert("Unable to detect ProtoshockLauncher!");
            window.close();
        };
    };
    plaunch.onopen = (event) => {
        plaunch.send("IsValidPLaunch");
    };
});