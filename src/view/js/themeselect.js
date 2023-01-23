var bootstrapcss, discordlogo, discordwidth, discordbtn, navbarcolor, seasonname;

var rootcss = document.querySelector(':root');

function check_holiday(dt_date) {

    // check simple dates (month/date - no leading zeroes)
    var n_date = dt_date.getDate(),
        n_month = dt_date.getMonth() + 1;
    var s_date1 = n_month + '/' + n_date;

    if (s_date1 == '1/1' // New Year's Day
        ||
        s_date1 == '6/14' // Flag Day
        ||
        s_date1 == '7/4' // Independence Day
        ||
        s_date1 == '11/11' // Veterans Day
        ||
        s_date1 == '12/25' // Christmas Day
    ) return true;

    // weekday from beginning of the month (month/num/day)
    var n_wday = dt_date.getDay(),
        n_wnum = Math.floor((n_date - 1) / 7) + 1;
    var s_date2 = n_month + '/' + n_wnum + '/' + n_wday;

    if (s_date2 == '1/3/1' // Birthday of Martin Luther King, third Monday in January
        ||
        s_date2 == '2/3/1' // Washington's Birthday, third Monday in February
        ||
        s_date2 == '5/3/6' // Armed Forces Day, third Saturday in May
        ||
        s_date2 == '9/1/1' // Labor Day, first Monday in September
        ||
        s_date2 == '10/2/1' // Columbus Day, second Monday in October
        ||
        s_date2 == '11/4/4' // Thanksgiving Day, fourth Thursday in November
    ) return true;

    // weekday number from end of the month (month/num/day)
    var dt_temp = new Date(dt_date);
    dt_temp.setDate(1);
    dt_temp.setMonth(dt_temp.getMonth() + 1);
    dt_temp.setDate(dt_temp.getDate() - 1);
    n_wnum = Math.floor((dt_temp.getDate() - n_date - 1) / 7) + 1;
    var s_date3 = n_month + '/' + n_wnum + '/' + n_wday;

    if (s_date3 == '5/1/1' // Memorial Day, last Monday in May
    ) return true;

    // misc complex dates
    if (s_date1 == '1/20' && (((dt_date.getFullYear() - 1937) % 4) == 0)
        // Inauguration Day, January 20th every four years, starting in 1937. 
    ) return true;

    if (n_month == 11 && n_date >= 2 && n_date < 9 && n_wday == 2
        // Election Day, Tuesday on or after November 2. 
    ) return true;

    return false;
}

if (currentMonth == 10) {
    bootstrapcss = "vapor";
    discordlogo = "discord/discord-halloween-nobg.png";
    discordwidth = "25px";
    navbarcolor = "info";
    seasonname = "Halloween";
    var egg = new Egg("h,p,p,y,h,l,w,n", function() {
        $("#DLGMODAL").modal({ backdrop: 'static', keyboard: false });
        document.getElementById("DLMODAL-title").innerHTML = "Happy Halloween!";
        document.getElementById("DLMODAL-body").innerHTML = "<img src='./img/season/pumpkin-smile.gif' />"; //"<video autoplay loop nocontrols><source src='./img/discord/discord-halloween.webm' type='video/webm'></source></video>";
        $('#DLGMODAL').modal('show');
        setTimeout(function() {
            $('#DLGMODAL').modal('hide');
        }, 5000);
    }).listen();
} else if (currentMonth == 11) {
    bootstrapcss = "darkly";
    discordlogo = "discord/discord-logo-white.svg";
    discordwidth = "25px";
    navbarcolor = "";
    seasonname = "Thanksgiving";
    var egg = new Egg("h,p,p,y,t,g", function() {
        $("#DLGMODAL").modal({ backdrop: 'static', keyboard: false });
        document.getElementById("DLMODAL-title").innerHTML = "Happy Thanksgiving!";
        document.getElementById("DLMODAL-body").innerHTML = "<img src='./img/season/turkey.gif' />";
        $('#DLGMODAL').modal('show');
        setTimeout(function() {
            $('#DLGMODAL').modal('hide');
        }, 5000);
    }).listen();
} else if (currentMonth == 12) {
    bootstrapcss = "darkly";
    discordlogo = "discord/discord-christmas-nobg.png";
    discordwidth = "25px";
    navbarcolor = "";
    seasonname = "Christmas";
    var egg = new Egg("m,r,r,y,c,m", function() {
        $("#DLGMODAL").modal({ backdrop: 'static', keyboard: false });
        document.getElementById("DLMODAL-title").innerHTML = "Merry Christmas!";
        document.getElementById("DLMODAL-body").innerHTML = "<img src='./img/season/snoman.gif' />";
        $('#DLGMODAL').modal('show');
        setTimeout(function() {
            $('#DLGMODAL').modal('hide');
        }, 5000);
    }).listen();
} else {
    bootstrapcss = "quartz";
    discordlogo = "discord/discord-logo-white.svg";
    discordwidth = "22px";
    navbarcolor = "dark";
    seasonname = "";
};

discordbtn = {
    "href": "https://discord.com/invite/acApgmT7k7",
    "img": `./img/${discordlogo}`,
    "width": `${discordwidth}`
};

var forceenabletransparency = false;

var enabletransparency = false;

if (process.platform == "win32" || process.platform == "darwin") {
    enabletransparency = true;
};

if (forceenabletransparency != null && forceenabletransparency == true) {
    enabletransparency = true;
};

//Set transparency:
if (enabletransparency == true) {
    console.log("Enabling transparency");
    rootcss.style.setProperty('--bs-transparent', 'transparent');
} else {
    console.log("Disabling transparency");
    rootcss.style.setProperty('--bs-transparent', '#18272c');
};