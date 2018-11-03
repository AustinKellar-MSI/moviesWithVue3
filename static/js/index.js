// this is a global variable that we will use to tell python to submit None
// undefined translates to None in python
// null translates to "", so it is IMPORTANT to use undefined when you want Python to read None
const None = undefined;

// Enumerates an array.
// this will give an _idx attribute to each movie
// the _idx will be assigned 0, 1, 2, 3 ...
var enumerate = function(arr) { 
    var k=0; return arr.map(function(e) {
        e._idx = k++;
    });
};

var processMovies = function() {
    enumerate(app.movies);
    app.movies.map(function(movie) {
        // we need to use vue.set here so that the vairable responds to changes in the view
        Vue.set(movie, 'hoverThumb', null);
    });
};

var onPageLoad = function() {
    $.getJSON('/moviesWithVue3/api/get_all_movies/',
        function(response) {
            app.movies = response.movies;
            processMovies();
        }
    );
};

var insertMovie = function() {
    var newMovie = {
        title: app.newMovieTitle,
        description: app.newMovieDescription,
        rating: app.newMovieRating
    };
    $.post('/moviesWithVue3/api/insert_movie/', newMovie, function(response) { 
        // the server responded with the id number of the new movie in the database. make sure to add this to the
        // new movie object before we add it to the view
        newMovie['id'] = response.new_movie_id;
        newMovie.thumb = null; // the new movie should start off with no thumb value
        app.movies.push(newMovie);
        processMovies(); // ned to re-index the movies now that a new one has been added to thea array
    });
};

var handleThumbClick = function(movieIdx, newThumbState) {
    // if we call this function, and the thumb has the same value, we want to de-select it's 
    // so we set the new thumb state to null! (this translates to None in python)
    var jsThumbValue = newThumbState;
    var pythonThumbValue = newThumbState
    if(app.movies[movieIdx].thumb == newThumbState) {
        jsThumbValue = null;
        pythonThumbValue = None; // remember, this is a global variable that was declared at the top. None == undefined
    }
    $.post('/moviesWithVue3/api/set_thumb/', { id: app.movies[movieIdx].id, thumb_state: pythonThumbValue }, function(response) {
        // after the web2py server responds, we know the thumb as been updated in the database
        // now, we just have to display the new thumb on the screen
        app.movies[movieIdx].thumb = jsThumbValue;
    });
};

var handleThumbMouseOver = function(movieIdx, newHoverThumbState) {
    app.movies[movieIdx].hoverThumb = newHoverThumbState;
};

var handleThumbMouseOut = function(movieIdx) {
    app.movies[movieIdx].hoverThumb = null;
};

// here, we define the Vue variable. Remember, only the fields defined here (in data and methods) are 
// available inside the html
var app = new Vue({
    el: '#app',
    delimiters: ['${', '}'],
    unsafeDelimiters: ['!{', '}'],
    data: {
        newMovieTitle: "",
        newMovieDescription: "",
        newMovieRating: "",
        movies: []
    },
    methods: {
        submitMovie: insertMovie,
        clickThumb: handleThumbClick,
        hoveringThumb: handleThumbMouseOver,
        mouseLeaveThumb: handleThumbMouseOut
    }
});

onPageLoad();