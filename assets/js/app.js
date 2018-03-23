var GiphyStuff = (function() {

    var localStorageRatings = []; // arrays for local storage use
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
    var getData = function(search, offset) {
        var offset = offset || 0;
        var apiKey = "h31f12EISLE8YkJ1XsRX5Yj8XZxNIgu4";
        var queryURL = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${search}&limit=10&offset=${offset}`;
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function(response) {
            printData(response);
        });
    };
    /**
     * [printData prints the gifs to the page]
     */
    var printData = function(response) {
      var url = window.location.href;
      var anyOffset = getQueryString('offset', url);

      if(anyOffset === null) {
        $("#the-gifs").empty();
        if (response.data.length === 0) {
            $("#the-gifs").prepend(`
            <div>
              <p>You're search came up empty...</p>
            </div>
          `);
        } else {
          postNewData(response);
        }
      }else {
        postNewData(response);
      }
    };
    /**
     * [postNewData post new gifs to the page]
     */
    var postNewData = function(response) {
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
            if (history.pushState) {
              var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?search=' + value;
              window.history.pushState({path:newurl},'',newurl);
            }
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
        $(document.body).on('click', '#addGiphs', function(event) {
            event.preventDefault();

            var url = window.location.href,
                offset = getQueryString('offset', url),
                search = getQueryString('search', url),
                separator = (url.indexOf("?") === -1) ? "?" : "&";
            if(offset === null) {
              offset = 10;
              if (history.pushState) {
                var newParam = separator + "offset=" + offset;
                var newurl = url.replace(newParam, "");
                    newurl += newParam;
                window.history.pushState({path:newurl},'',newurl);
              }
            }else {
              offset = Number(offset) + 10;
              if (history.pushState) {
                var newurl = url.split( '&' )[0];
                var newParam = separator + "offset=" + offset;
                    newurl += newParam;
                window.history.pushState({path:newurl},'',newurl);
              }
            }
            getData(search, offset);
        });

    };
    /**
     * [getQueryString get a specific query parameter in the url]
     */
    var getQueryString = function ( field, url ) {
      var href = url ? url : window.location.href;
      var reg = new RegExp( '[?&]' + field + '=([^&#]*)', 'i' );
      var string = reg.exec(href);
      return string ? string[1] : null;
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
        //make sure slickjs carousel is on the page before checking local storage
        var checkExist = setInterval(function() {
           if ($('.slick-initialized').length) {
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