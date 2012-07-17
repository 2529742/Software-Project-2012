/**
 * @author Group 2
 */

//defining a custom grammar is not possible yet
//document.body.innerHTML += '<div id="gVContainer" class="popup" ><input id="googleVoice" type="text" x-webkit-grammar="grammar.grxml" onwebkitspeechchange="onChange(this.value)" x-webkit-speech /></div>';

//this is the div for googleVoice
var gvContainer = document.createElement('div');
gvContainer.setAttribute('id', 'gvContainer');
gvContainer.setAttribute('class', 'popup');
var googleVoice = document.createElement('input');
googleVoice.setAttribute('id', 'googleVoice');
googleVoice.setAttribute('class', 'popup');
googleVoice.setAttribute('type', 'text');
googleVoice.onwebkitspeechchange = function() {
    onChange();
};
googleVoice.onwebkitspeecherror = function() {
    speekOutput('Sorry there was an unexpected error', 'error');
    alert('error');
};
googleVoice.setAttribute('x-webkit-speech', 'x-webkit-speech');
var closeButton = document.createElement('button');
closeButton.setAttribute('id', 'closeButton');
closeButton.innerText = 'Close';
closeButton.onclick = function() {
    makeInputInvisible(googleVoice, gvContainer);
    clickCounter = 0;
};
gvContainer.appendChild(closeButton);
gvContainer.appendChild(googleVoice);
document.body.appendChild(gvContainer);

//this is the div for annotations-checkbox
var selectionContainer = document.createElement('div');
selectionContainer.setAttribute('id', 'selectionContainer');
selectionContainer.setAttribute('class', 'popup');
var title = document.createElement('legend');
title.setAttribute('class', 'popup');
title.innerHTML = "Pleasy choose the correct annotation";
var table = document.createElement('table');
table.setAttribute('class', 'popup');
var btn = document.createElement('button');
btn.setAttribute('id', 'annotateButton');
btn.setAttribute('type', 'button');
btn.innerText = "Annotate"; 

table.appendChild(title);
selectionContainer.appendChild(table);
selectionContainer.appendChild(btn);
document.body.appendChild(selectionContainer);

var focusElement = "";

var imageParent;
var image;
var imageId = "ThisIsImageNo";
var imageNo = 1;

function imageEventListener() {
    focusElement = "image";
    image = event.target;

    if ($(event.target).is('.highlight')) {
        alert('you already tagged this element')
    } else {
        imageParent = image.parentElement;
        makeInputVisible(googleVoice, gvContainer);
    }
}

//this appends the Spoken Interaction Functionality to all img-elements in the DOM
var images = document.getElementsByTagName('img');
for (var i = 0; i < images.length; i++) {
    images[i].addEventListener("click", imageEventListener, false);
};

var textId = "ThisIsTextNo";
var textNo = 1;

var text;
var textParent;

function textEventListener() {
    focusElement = "text";
    if ($(event.target).is('.highlight')) {
        //alert('you already tagged this element');
    } else {
        makeInputVisible(googleVoice, gvContainer);
        var selection = window.getSelection();
        text = selection.toString();
        textParent = $(selection.focusNode.parentElement);
    }
}

var spans = document.getElementsByTagName('span');
for (var i = 0; i < spans.length; i++) {
    spans[i].addEventListener("mouseup", textEventListener, false);
};

//this locks the screen during spoken output
var lockingScreen = document.createElement('div');
var screenInfo = document.createElement('p');
lockingScreen.setAttribute('id', 'lockScreen');
screenInfo.setAttribute('id', 'screenInfo');
screenInfo.style.width = '500px';
lockingScreen.appendChild(screenInfo);
document.body.appendChild(lockingScreen);

//this is the Spoken Output element
var spokenOutput = document.createElement('audio');
document.body.appendChild(spokenOutput);
spokenOutput.setAttribute('id', 'spokenOutput');

//this stores the clicked element and the previous clicked element for the dialogue management
var prevClickedElement;
var clickedElement;
var clickCounter = 2;

//this is the alternative input element
var altInputContainer = document.createElement('div');
altInputContainer.setAttribute('id', 'altInputContainer');
altInputContainer.setAttribute('class', 'popup');
var altInput = document.createElement('input');
altInput.setAttribute('class', 'popup');
altInput.setAttribute('id', 'altInput');
altInput.setAttribute('type', 'text');
var altInputSubmit = document.createElement('input');
altInputSubmit.setAttribute('id', 'altInputSubmit');
altInputSubmit.setAttribute('type', 'submit');
altInputSubmit.setAttribute('value', 'Tag it!');
altInputSubmit.onclick = function() {
    var val = altInput.value
    val.toLowerCase();
    var results = runParser(val.split(/\s+/));
    dialogueManager(results, val);
    makeInputInvisible(altInput, altInputContainer);
};
altInputContainer.appendChild(altInput);
altInputContainer.appendChild(altInputSubmit);
document.body.appendChild(altInputContainer);

//this is the element for the VIE.analyze() function
var annotationP = document.createElement('p');
annotationP.style.visibility = 'hidden';
annotationP.setAttribute('id', 'analyze_me');
document.body.appendChild(annotationP);

function makeInputVisible(inputElement, containerElement) {
    inputElement.value = '';
    containerElement.style.visibility = 'visible';
}

function makeInputInvisible(inputElement, containerElement) {
    containerElement.style.visibility = 'hidden';
    inputElement.value = '';
}

function onChange() {
    //this function processes what the user said with js-chartparser
    if ( typeof (prevClickedElement) !== 'undefined') {
        prevClickedElement = clickedElement;
        clickedElement = event.target;
    } else {
        prevClickedElement = event.target;
    }

    var val = event.target.value;
    alert("you said:" + val);
    makeInputInvisible(googleVoice, gvContainer);
    val.toLowerCase();
    results = runParser(val.split(/\s+/));
    dialogueManager(results, val);
}

function dialogueManager(results, val) {
    //this function imitates a dialogue manager and handles diverse errors or unparseable user input

    //triggered if grammar rejects input
    if (parseInt(results[0]) == 0) {
        //triggered if for the same element the input is rejected 3 times
        if (clickedElement == prevClickedElement && clickCounter > 0) {
            makeInputInvisible(googleVoice, gvContainer);
            speekOutput('try the alternative input', 'alternativeInput');
            makeInputVisible(altInput, altInputContainer);
            clickCounter = 0;
        } else {
            clickCounter += 1;
            clickedElement = prevClickedElement;
            speekOutput(val, 'unparseable');
            makeInputVisible(googleVoice, gvContainer);
        }

    }
    //triggered if input is accepted
    if (parseInt(results[0]) >= 1) {
        clickCounter = 0;
        if (focusElement == "text") {
            getAnnotation(results, function(ann) {
                if (ann.length > 1) {
                    useCheckbox(ann, 'text');
                } else if (ann.length == 1) {
                    annotateText(ann[0]);
                } else {
                    speekOutput(val, 'noAnnotation');
                }
            });
        }
        if (focusElement == "image") {
            getAnnotation(results, function(ann) {
                if (ann.length > 1) {
                    useCheckbox(ann, 'image');
                } else if (ann.length == 1) {
                    annotateImage(ann[0]);
                } else {
                    speekOutput(val, 'noAnnotation');
                }
            });
        }
        clickCounter = 0;

    }
}

function getAnnotation(grammarResults, callback) {
    var annotations = []
    var vie = new VIE();
    var stnblService = new vie.StanbolService();
    var dbpService = new vie.DBPediaService();
    vie.use(stnblService, "stanbol");
    vie.use(dbpService, "dbpedia");

    vie.find({
        term : grammarResults[1],
        field : "rdfs:label",
        properties : ["skos:prefLabel", "rdfs:label"] // are going to be loaded with the result entities
    }).using("stanbol").execute().done(function(ent) {
        _.each(ent, function(e) {
            vie.load({
                entity : e
            }).using("dbpedia").execute().done(function(entity) {
                if (entity.isof("dbpedia:Place") || entity.isof("dbpedia:Person")) {
                    var url = e.getSubjectUri();
                    var label = VIE.Util.getPreferredLangForPreferredProperty(e, ['rdfs:label'], ['en', 'de']);
                    var fullAbstract = VIE.Util.getPreferredLangForPreferredProperty(e, ['http://dbpedia.org/ontology/abstract'], ['en', 'de']);

                    var fullWords = fullAbstract.split(" ");
                    var shortWords = [];
                    var numberOfWords;
                    if (fullWords.length >= 20) {
                        numberOfWords = 20;
                    } else {
                        numberOfWords = fullWords.length
                    }
                    for (var i = 0; i < numberOfWords; i++) {
                        shortWords.push(fullWords[i]);
                    }
                    shortAbstract = shortWords.join(" ");
                    var txt = '<p><a target="_blank" href="' + url + '">' + label + '</a><br/>' + shortAbstract + ' [...]</p>'
                    console.log(txt);
                    annotations.push(txt);
                }

                callback(annotations);
            });
        });
    });

    /**
     var annoText = "";

     for (var i = 0; i < (parseInt(grammarResults[0]) + 1); i++) {
     if (i > 0) {
     annoText += grammarResults[i] + " is great. "
     }
     };
     $('#analyze_me').text(annoText);

     vie.analyze({
     element : $('#analyze_me')
     }).using("stanbol").done(function(ent) {
     _.each(ent, function(e) {
     var url = e.getSubjectUri();
     var label = VIE.Util.getPreferredLangForPreferredProperty(e, ['rdfs:label'], ['en', 'de']);
     if (label === 'n/a') {
     return true;
     }
     //jQuery('#result').append(jQuery('<a target="_blank" href="' + url + '">' + label + '</a><br />'));
     annotations.push('<a target="_blank" href="' + url + '">' + label + '</a><br />');
     console.log(annotations);
     });
     callback(annotations);
     }).execute();

     **/
}

function useCheckbox(VIEannotations, focus) {
    //in case there is more than one possible annotation to an element from VIE/stanbol, then select one annotation and use it
    for (var i = 0; i < VIEannotations.length; i++) {
        tr = document.createElement('tr');
        tr.setAttribute('class', 'popup');
        td1 = document.createElement('td');
        td1.setAttribute('class', 'popup');
        td1.innerHTML = VIEannotations[i];
        radioButton = document.createElement('input');
        radioButton.setAttribute('type', 'radio');
        radioButton.setAttribute('name', 'annotationBtn');

        if (i == 0) {
            radioButton.checked = true;
        }

        td2 = document.createElement('td');
        td2.setAttribute('class', 'popup');
        td2.appendChild(radioButton);

        tr.appendChild(td1);
        tr.appendChild(td2);
        table.appendChild(tr);
    };

    selectionContainer.style.visibility = 'visible';

    btn.addEventListener('click', function() {
        radioBtns = document.getElementsByName('annotationBtn');
        for (var i = 0; i < radioBtns.length; i++) {
            if (radioBtns[i].checked) {
                console.log(VIEannotations[i]);
                selectionContainer.style.visibility = 'hidden';
                if (focus == 'text') {
                    annotateText(VIEannotations[i]);
                }
                if (focus == 'image') {
                    annotateImage(VIEannotations[i]);
                }
            }
        };

        while (table.hasChildNodes()) {
            table.removeChild(table.firstChild);
        }
    }, false);

}

function buildTip(VIEannotations, element) {
    // Selects one or more elements to assign a simpletip to

    console.log('tip is initialized with text: ' + VIEannotations);
    /**
     $(element).simpletip({
     // Configuration properties
     content : VIEannotations,
     persistent : true,
     fixed : true,
     position : 'right',
     showEffect : 'custom',
     showCustom : function() {
     // Note the this attribute refers to the tooltip itself
     $(this).css({
     fontSize : '12px',
     display : 'block'
     }).animate({
     fontSize : '20px'
     }, 400);
     }
     });
     **/

    tip = document.createElement('div');
    tip.innerHTML = VIEannotations;
    tip.setAttribute('class', 'tooltip');
    tip.style.visibility = 'hidden';
    element.appendChild(tip);

}

function annotateText(VIEannotations) {
    if ($(textParent).is('.highlight')) {
        alert('already annotated');
    } else {
        var oldHtml = textParent.html();
        var newHtml = oldHtml.replace(text, "<span id='" + textId + textNo + "' class='highlight'>" + text + "</span>");
        textParent.html(newHtml);
        var element = document.getElementById(textId + textNo);
        buildTip(VIEannotations, element);
    }

    elementChildren = element.childNodes;
    for (var i = 0; i < elementChildren.length; i++) {
        e = elementChildren[i];
        if ($(e).is('.tooltip')) {
            element.addEventListener('mouseover', function() {
                e.style.visibility = 'visible';
            }, false);
            element.addEventListener('mouseout', function() {
                e.style.visbility = 'hidden';
            }, false);
        }
    };

    textNo++;
}

function annotateImage(VIEannotations) {
    if ($(imageParent).is('.highlight')) {
        alert('already annotated');
    } else {
        var oldChild = image;
        var width = oldChild.clientWidth;
        var height = oldChild.clientHeight;
        var newChild = document.createElement('div');
        newChild.setAttribute('class', 'highlight');
        newChild.setAttribute('id', imageId + imageNo);
        newChild.style.width = width + 'px';
        newChild.style.height = height + 'px';
        var copy = oldChild.cloneNode(true);
        newChild.appendChild(copy);
        imageParent.replaceChild(newChild, oldChild);
        var element = document.getElementById(imageId + imageNo);
        buildTip(VIEannotations, element);

    }

    elementChildren = element.childNodes;
    for (var i = 0; i < elementChildren.length; i++) {
        e = elementChildren[i];
        if ($(e).is('.tooltip')) {
            element.addEventListener('mouseover', function() {
                e.style.visibility = 'visible';
            }, false);
            element.addEventListener('mouseout', function() {
                e.style.visbility = 'hidden';
            }, false);
        }

    };

    textNo++;

}

function speekOutput(customMessage, status) {
    //this function manages the spoken Output "I'm sorry I don't understand what ... is supposed to mean. Please rephrase your command"
    var url = "http://mary.dfki.de:59125/";
    //not dfki dependent
    //var url = 'http://134.96.189.12:59125/'; //dfki dependent

    //generate an output string for the MaryTTS
    var str = '';
    var messageArray = customMessage.split(/\s+/);
    for (var i = 0; i < messageArray.length; i++) {
        if (i == messageArray.length - 1) {
            str += messageArray[i];
        } else {
            str += messageArray[i] + "+";
        }
    };

    var speek = "";
    var write = "";

    if (status == 'unparseable') {
        write += 'I am sorry, I could not understand what "' + customMessage + '" is supposed to mean! Please rephrase your command!';
        speek += "I'm%20sorry%2C%20I%20could%20not%20understand%20what%20%22" + str + "%22%20is%20supposed%20to%20mean.%20Please%20rephrase%20your%20command.";
    }
    if (status == 'error') {
        write += "Sorry, there was an unexpected error";
        speek += str;
    }
    if (status == 'alternativeInput') {
        write += "Unfortunately, it seems like I do not understand you correctly. Please try the written input to tag this element!"
        speek += "Unfortunately%2C%20it%20seems%20like%20I%20do%20not%20understand%20you%20correctly.%20Please%20try%20the%20written%20input%20to%20tag%20this%20element!&amp;";
    }
    if (status == 'noAnnotation') {
        write += 'I could not find any annotation entry in my database for "' + customMessage + '"!';
        speek += "I%20could%20not%20find%20any%20annotation%20entry%20in%20my%20database%20for%20%22" + str + "%22!&amp;";
    }

    var maryString = "process?INPUT_TYPE=TEXT&OUTPUT_TYPE=AUDIO&INPUT_TEXT=" + speek + "&OUTPUT_TEXT=&effect_Volume_selected=&effect_Volume_parameters=amount%3A2.0%3B&effect_Volume_default=Default&effect_Volume_help=Help&effect_TractScaler_selected=&effect_TractScaler_parameters=amount%3A1.5%3B&effect_TractScaler_default=Default&effect_TractScaler_help=Help&effect_F0Scale_selected=&effect_F0Scale_parameters=f0Scale%3A2.0%3B&effect_F0Scale_default=Default&effect_F0Scale_help=Help&effect_F0Add_selected=&effect_F0Add_parameters=f0Add%3A50.0%3B&effect_F0Add_default=Default&effect_F0Add_help=Help&effect_Rate_selected=&effect_Rate_parameters=durScale%3A1.5%3B&effect_Rate_default=Default&effect_Rate_help=Help&effect_Robot_selected=&effect_Robot_parameters=amount%3A100.0%3B&effect_Robot_default=Default&effect_Robot_help=Help&effect_Whisper_selected=&effect_Whisper_parameters=amount%3A100.0%3B&effect_Whisper_default=Default&effect_Whisper_help=Help&effect_Stadium_selected=&effect_Stadium_parameters=amount%3A100.0&effect_Stadium_default=Default&effect_Stadium_help=Help&effect_Chorus_selected=&effect_Chorus_parameters=delay1%3A466%3Bamp1%3A0.54%3Bdelay2%3A600%3Bamp2%3A-0.10%3Bdelay3%3A250%3Bamp3%3A0.30&effect_Chorus_default=Default&effect_Chorus_help=Help&effect_FIRFilter_selected=&effect_FIRFilter_parameters=type%3A3%3Bfc1%3A500.0%3Bfc2%3A2000.0&effect_FIRFilter_default=Default&effect_FIRFilter_help=Help&effect_JetPilot_selected=&effect_JetPilot_parameters=&effect_JetPilot_default=Default&effect_JetPilot_help=Help&HELP_TEXT=&exampleTexts=I'm%20Spike.&VOICE_SELECTIONS=dfki-spike%20en_GB%20male%20unitselection%20general&AUDIO_OUT=WAVE_FILE&LOCALE=en_GB&VOICE=dfki-spike&AUDIO=WAVE_FILE";

    $.ajax({
        url : url + maryString,
        type : "GET",
        dataType : 'jsonp audio/x-wav',
        statusCode : {
            404 : function() {
                alert(write);
            },
            200 : function() {

                spokenOutput.load();

                lockScreen(write);
                spokenOutput.setAttribute('src', url + maryString);
                spokenOutput.play();
                spokenOutput.addEventListener('ended', unlockScreen, false);
            }
        },
        cache : false,
    });
}

function lockScreen(message) {
    $("input").blur();
    screenInfo.textContent = message;
    lockingScreen.style.visibility = 'visible';
}

function unlockScreen() {
    screenInfo.textContent = '';
    lockingScreen.style.visibility = 'hidden';
}
