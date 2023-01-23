/* Functions */
function storeData(name, value) {
    localStorage.setItem(name, value);
}

function updateData(name, value) {
    localStorage.setItem(name, value);
}

function getData(name) {
    let data = localStorage.getItem(name);
    return data;
}

document.addEventListener('DOMContentLoaded', function() {
    var UIdlmcheckbox = document.getElementById('UITransparency');
    var DiscordRPCCheckbox = document.getElementById('ShowDiscordRPC');

    /*Get launcher UITransparency pref*/
    var Transparency = getData('UIdlm');

    if (Transparency == null) {
        console.warn("No transparency preference saved, using transparency = false.");
        storeData('UIdlm', false);
    };

    if (Transparency != null) {
        console.log("UIdlm saved, using " + Transparency);
        UIdlmcheckbox.checked = Transparency;
        if (Transparency == 'false') {
            UIdlmcheckbox.checked = false;
            rootcss.style.setProperty('--bs-transparent', '#18272c');
        } else if (Transparency == 'true') {
            UIdlmcheckbox.checked = true;
            rootcss.style.setProperty('--bs-transparent', 'transparent');
        };
    } else {
        UIdlmcheckbox.checked = false;
        rootcss.style.setProperty('--bs-transparent', '#18272c');
    };

    UIdlmcheckbox.onchange = function() {
        var UIdlm = UIdlmcheckbox.checked;
        if (UIdlm == null) {
            console.warn("No UIdlm selected, using true");
            error.play();
            storeData('UIdlm', true);
        } else {
            //console.log("UIdlm selected: " + UIdlm);
            UIdlmcheckbox.checked = UIdlm;
            if (UIdlm == false) {
                rootcss.style.setProperty('--bs-transparent', '#18272c');
            } else if (UIdlm == true) {
                rootcss.style.setProperty('--bs-transparent', 'transparent');
            };
            if (getData('UIdlm')) {
                updateData('UIdlm', UIdlm);
            } else {
                storeData('UIdlm', UIdlm);
            }
        };
    };

    /*Get launcher DiscordRPC pref*/
    var DiscordRPC = getData('DiscordRPC');

    if (DiscordRPC == null) {
        console.warn("No DiscordRPC preference saved, using DiscordRPC = false.");
        storeData('DiscordRPC', false);
    };

    if (DiscordRPC != null) {
        console.log("DiscordRPC saved, using " + DiscordRPC);
        DiscordRPCCheckbox.checked = DiscordRPC;
        if (DiscordRPC == 'false') {
            DiscordRPCCheckbox.checked = false;
            showrpc = false;
        } else if (Transparency == 'true') {
            DiscordRPCCheckbox.checked = true;
            showrpc = true;
        };
    } else {
        DiscordRPCCheckbox.checked = false;
        showrpc = false;
    };

    DiscordRPCCheckbox.onchange = function() {
        var DiscordRPC = DiscordRPCCheckbox.checked;
        if (DiscordRPC == null) {
            console.warn("No DiscordRPC selected, using true");
            error.play();
            storeData('DiscordRPC', true);
        } else {
            //console.log("DiscordRPC selected: " + DiscordRPC);
            DiscordRPCCheckbox.checked = DiscordRPC;
            if (DiscordRPC == false) {
                showrpc = false;
            } else if (DiscordRPC == true) {
                showrpc = true;
            };
            if (getData('DiscordRPC')) {
                updateData('DiscordRPC', DiscordRPC);
            } else {
                storeData('DiscordRPC', DiscordRPC);
            }
        };
    };

    /* Get launcher game pref */
    //let data = JSON.stringify({ "version": `${gamever}`, "dldate": `${currentMonth}/${currentDay}/${currentYear}` });
    //fs.writeFileSync(path.join(gamepath, 'launcherdescriptor.json'), data);
});