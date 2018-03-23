var GiphyStuff = (function() {

    var localStorageRatings = [];
    var localStorageGiphys = [];
    /**
     * [addButtons buttons to add by default to the page]
     */
    var addButtons = function() {
        var buttonsArray = ['Black widow', 'Boar', 'Bobcat', 'Buffalo', 'Bull', 'Camel', 'Carp', 'Cat', 'Chicken', 'Clownfish', 'Cow', 'Coyote', 'Dog', 'Dolphin', 'Dragonfly', 'Emu', 'Fish', 'Frog', 'Goat', 'Grasshopper', 'Hawk', 'Hornet', 'Jellyfish', 'Lion', 'Lobster', 'Octopus', 'Peacock', 'Polar bear', 'Snail', 'Tiger', 'Whale', 'Zebra'];
        buttonsArray.forEach(function(element) {
            $('#animal-buttons').append(`<button>${element}</button>`);
        });
    };
    /**
     * [getData get the data from the giphy api]
     */
    var getData = function(search) {
        var apiKey = "h31f12EISLE8YkJ1XsRX5Yj8XZxNIgu4";
        var queryURL = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${search}&limit=10`;

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function(response) {
            console.log(response);
            printData(response);
        });
    };
    /**
     * [printData prints the gifs to the page]
     */
    var printData = function(response) {
        $("#the-gifs").empty();
        if (response.data.length === 0) {
            $("#the-gifs").prepend(`
            <div>
              <p>You're search came up empty...</p>
            </div>
          `);
        } else {
            response.data.forEach(function(giphy) {
                var rating = giphy.rating;
                var theGiphy = giphy.images.original.url;
                var theGiphyStill = giphy.images.fixed_width_still.url;
                $("#the-gifs").prepend(`
                <div class="col-md-4">
                  <p class="text-center">Rating: ${rating}  <span class="giphy-unliked"><i class="far fa-heart"></i></span></p>
                  <img data-state="still" data-still="${theGiphyStill}" data-animate="${theGiphy}" src="${theGiphyStill}">
                </div>
              `);
            });
        }
    };
    /**
     * [initSlick initializes the slick.js carousel]
     */
    var initSlick = function() {
        $(document).ready(function() {
            $('.slick-carousel').slick({
                slidesToShow: 2,
                slidesToScroll: 2
            });
        });
    };
    /**
     * [eventHandlers ... on click events]
     */
    var eventHandlers = function() {
        //when buttons are clicked
        $(document.body).on('click', '#animal-buttons button', function() {
            var value = $(this).text().trim();
            getData(value);
        });

        //when search submit form is clicked
        $(document.body).on('click', '#addAnimal', function(event) {
            event.preventDefault();
            var value = $('#animal-input').val().trim();
            $('#animal-input').val('');
            $('#animal-buttons').append(`<button>${value}</button>`);
        });

        //when the gif image is clicked, change the state
        $(document.body).on('click', '#the-gifs div img', function() {
            var state = $(this).attr('data-state');
            console.log(state);
            if (state === 'still') {
                var animate = $(this).attr('data-animate');
                $(this).attr('src', animate);
                $(this).attr('data-state', 'animate');
            } else if (state === 'animate') {
                var still = $(this).attr('data-still');
                $(this).attr('src', still);
                $(this).attr('data-state', 'still');
            }
        });

        //when the heart is clicked, add the gif to the carousel and change the heart
        $(document.body).on('click', '.giphy-unliked', function() {
            $(this).removeClass('giphy-unliked').addClass('giphy-liked');
            $(this).find('svg').addClass('fas');
            var img = $(this).parents().siblings('img').attr('data-still');
            var rating = $(this).parents('p').text().trim();
            var theGiphy = $(this).parents().siblings('img').attr('data-animate');
            $('.slick-carousel').slick('slickAdd', `<div class="slick-giphy"><img data-animate="${theGiphy}" src="${theGiphy}"/><p>${rating}</p></div>`);
            addToLocalStorage(rating, theGiphy);
        });

        //when user clicks add more gifs
        $(document.body).on('click', '#addMore', function(event) {
            event.preventDefault();
            console.log('add more');
        });

    };
    /**
     * [getLocalStorage get local storage if there is local storage.
     * If there is local storage, populate the slick.js carousel with what is in local storage.]
     */
    var getLocalStorage = function() {
      var ratings = localStorage.getItem("ratings");
      var giphys = localStorage.getItem("giphys");
      if(typeof ratings === 'string') {
        localStorageGiphys = giphys = giphys.split(',');
        localStorageRatings = ratings = ratings.split(',');
        giphys.forEach(function(element, index) {
          $('.slick-carousel').slick('slickAdd', `<div class="slick-giphy"><img data-animate="${element}" src="${element}"/><p>${ratings[index]}</p></div>`);
        });        
      }
    };
    /**
     * [addToLocalStorage add items to local storage when the like (heart) button is clicked]
     */
    var addToLocalStorage = function(rating, theGiphy) {
      localStorageRatings.push(rating);
      localStorageGiphys.push(theGiphy);
      localStorage.setItem("ratings", localStorageRatings);
      localStorage.setItem("giphys", localStorageGiphys);
    };
    /**
     * [init functions]
     */
    var init = function() {
        addButtons();
        initSlick();
        eventHandlers();
        var checkExist = setInterval(function() {
           if ($('.slick-initialized').length) {
              console.log("Exists!");
              getLocalStorage();
              clearInterval(checkExist);
           }
        }, 100);
    };

    return {
        init: init
    };

})();

/**
 * init the app
 */
GiphyStuff.init();