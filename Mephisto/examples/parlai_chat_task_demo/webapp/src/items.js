function randomItem() { 
    <img src="mephisto.jpg" alt="Mephisto Chess Automaton" />
    alert("This is working")
    $.getJSON('data.json', function(res) {
        var arrayRandom = Math.floor(Math.random() * res.length);
        $('#display').html('<p> Category: ' + res.items[arrayRandom].category + '</p>'); 
        $('#display').append('<p> Title: ' + res.items[arrayRandom].title + '</p>'); 
        $('#display').append('<p> Description: ' + res.items[arrayRandom].description + '</p>'); 
        $('#display').append('<p> Price: ' + res.items[arrayRandom].price + '</p>'); 
    }); 
};

