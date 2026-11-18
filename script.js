// ===== Saving and loading data (localStorage) =====
// All feedback is stored in the browser under the name "messmateData"

function getData() {
    var saved = localStorage.getItem("messmateData");
    if (saved == null) {
        return [];
    }
    return JSON.parse(saved);
}

function saveData(list) {
    localStorage.setItem("messmateData", JSON.stringify(list));
}

// Stops user text from breaking the page if they type the < symbol
function safeText(text) {
    return text.split("<").join("&lt;");
}


// ===== Effects that run on every page =====
window.addEventListener("load", startEffects);

function startEffects() {
    showGreeting();
    setupReveal();
    makeTopButton();
    makeFloatingFood();
}


// ===== Home page: food emojis floating up in the hero =====
function makeFloatingFood() {
    var hero = document.getElementById("hero-area");
    if (hero == null) {
        return;
    }
    var foods = ["🍛", "🍚", "🥘", "🍕", "🥗", "☕", "🍎", "🍜", "🥟", "🍰"];
    for (var i = 0; i < 14; i++) {
        var item = document.createElement("span");
        item.className = "float-food";
        item.innerHTML = foods[i % foods.length];
        item.style.left = Math.random() * 95 + "%";
        item.style.fontSize = (22 + Math.random() * 26) + "px";
        item.style.animationDuration = (6 + Math.random() * 8) + "s";
        item.style.animationDelay = (Math.random() * 8) + "s";
        hero.appendChild(item);
    }
}


// ===== Greeting by time (home page) =====
function showGreeting() {
    var box = document.getElementById("greeting");
    if (box == null) {
        return;
    }
    var hour = new Date().getHours();
    var text = "Good Evening!";
    if (hour < 12) {
        text = "Good Morning!";
    } else if (hour < 17) {
        text = "Good Afternoon!";
    }
    box.innerHTML = text + " How was your meal?";
}


// ===== Fade-in cards while scrolling =====
function setupReveal() {
    var items = document.querySelectorAll(".meal-card, .step, .quick-box, .tech-box, .info-box");
    for (var i = 0; i < items.length; i++) {
        items[i].classList.add("reveal");
    }
    checkReveal();
    window.addEventListener("scroll", checkReveal);
}

function checkReveal() {
    var items = document.querySelectorAll(".reveal");
    for (var i = 0; i < items.length; i++) {
        var top = items[i].getBoundingClientRect().top;
        if (top < window.innerHeight - 40) {
            items[i].classList.add("show");
        }
    }
}


// ===== Back to top button =====
function makeTopButton() {
    var btn = document.createElement("button");
    btn.id = "topBtn";
    btn.innerHTML = "&#8593;";
    document.body.appendChild(btn);

    btn.onclick = function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.addEventListener("scroll", function () {
        if (window.scrollY > 300) {
            btn.style.display = "block";
        } else {
            btn.style.display = "none";
        }
    });
}


// ===== Count up animation for numbers =====
function countUp(id, target) {
    var box = document.getElementById(id);
    var n = 0;
    if (target == 0) {
        box.innerHTML = 0;
        return;
    }
    var step = Math.ceil(target / 25);
    var timer = setInterval(function () {
        n = n + step;
        if (n >= target) {
            n = target;
            clearInterval(timer);
        }
        box.innerHTML = n;
    }, 50);
}


// ===== Home page: show how many feedback are saved =====
function showHomeCount() {
    var list = getData();
    countUp("homeCount", list.length);
}


// ===== Feedback page: emoji and character counter =====
function showEmoji() {
    var rating = document.getElementById("rating").value;
    var faces = { "1": "😡", "2": "😞", "3": "😐", "4": "🙂", "5": "😍" };
    var box = document.getElementById("ratingEmoji");
    if (rating == "") {
        box.innerHTML = "";
    } else {
        box.innerHTML = faces[rating];
    }
}

function updateCount() {
    var length = document.getElementById("comment").value.length;
    document.getElementById("charCount").innerHTML = length + " / 200";
}


// ===== Feedback page: submit button =====
function submitFeedback() {
    var name = document.getElementById("studentName").value.trim();
    var meal = document.getElementById("meal").value;
    var category = document.getElementById("category").value;
    var rating = document.getElementById("rating").value;
    var comment = document.getElementById("comment").value.trim();
    var message = document.getElementById("message");

    // Checking the form
    if (meal == "" || category == "" || rating == "") {
        message.className = "msg error";
        message.innerHTML = "Please choose the meal, the category and the rating.";
        return;
    }

    if (comment.length < 5) {
        message.className = "msg error";
        message.innerHTML = "Please write a comment of at least 5 characters.";
        return;
    }

    if (name == "") {
        name = "Anonymous";
    }

    // Making one feedback object
    var item = {
        name: name,
        meal: meal,
        category: category,
        rating: Number(rating),
        comment: comment,
        date: new Date().toLocaleDateString()
    };

    // Adding it to the old list and saving
    var list = getData();
    list.push(item);
    saveData(list);

    // Clearing the form
    document.getElementById("studentName").value = "";
    document.getElementById("meal").value = "";
    document.getElementById("category").value = "";
    document.getElementById("rating").value = "";
    document.getElementById("comment").value = "";
    showEmoji();
    updateCount();

    message.className = "msg good";
    message.innerHTML = "Thank you! Your feedback is saved. You can see it on the Report page.";
}


// ===== Report page: numbers, chart and table =====
function showReport() {
    var list = getData();
    var filter = document.getElementById("filterMeal").value;

    var total = 0;
    var sum = 0;
    var low = 0;
    var counts = [0, 0, 0, 0, 0, 0];   // counts[1] to counts[5]

    var table = "<tr><th>Date</th><th>Name</th><th>Meal</th><th>Category</th><th>Rating</th><th>Comment</th></tr>";

    for (var i = 0; i < list.length; i++) {
        var item = list[i];

        // Skip this item if it does not match the selected meal
        if (filter != "All" && item.meal != filter) {
            continue;
        }

        total++;
        sum = sum + item.rating;
        counts[item.rating]++;

        // Colour of the rating badge: green = good, yellow = average, red = low
        var ratingClass = "rating-ok";
        if (item.rating <= 2) {
            low++;
            ratingClass = "rating-low";
        } else if (item.rating == 3) {
            ratingClass = "rating-mid";
        }

        table = table + "<tr>" +
            "<td>" + item.date + "</td>" +
            "<td>" + safeText(item.name) + "</td>" +
            "<td>" + item.meal + "</td>" +
            "<td>" + item.category + "</td>" +
            "<td><div class='rating-pill " + ratingClass + "'>" + item.rating + " / 5</div></td>" +
            "<td>" + safeText(item.comment) + "</td>" +
            "</tr>";
    }

    var average = 0;
    if (total > 0) {
        average = (sum / total).toFixed(1);
    }

    countUp("totalCount", total);
    document.getElementById("avgRating").innerHTML = average;
    countUp("lowCount", low);

    drawBars(counts, total);

    if (total == 0) {
        document.getElementById("feedbackTable").innerHTML = "";
        document.getElementById("emptyNote").innerHTML = "No feedback found. Go to the Give Feedback page and add some.";
    } else {
        document.getElementById("feedbackTable").innerHTML = table;
        document.getElementById("emptyNote").innerHTML = "";
    }
}


// ===== Report page: rating bar chart =====
function drawBars(counts, total) {
    var html = "";
    for (var star = 5; star >= 1; star--) {
        var percent = 0;
        if (total > 0) {
            percent = (counts[star] / total) * 100;
        }
        var color = "bar-green";
        if (star <= 2) {
            color = "bar-red";
        } else if (star == 3) {
            color = "bar-amber";
        }
        html = html + "<div class='bar-row'>" +
            "<span class='bar-label'>" + star + " star</span>" +
            "<div class='bar-track'><div class='bar-fill " + color + "' style='width:" + percent + "%'></div></div>" +
            "<span class='bar-count'>" + counts[star] + "</span>" +
            "</div>";
    }
    document.getElementById("barChart").innerHTML = html;
}


// ===== Report page: delete everything =====
function clearAll() {
    var sure = confirm("Do you really want to delete all feedback?");
    if (sure) {
        localStorage.removeItem("messmateData");
        showReport();
    }
}
