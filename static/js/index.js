// here, we declare a global variable
// in web2py will translate undefined (JS) to None, so we define this variable for convenience
// it is important to note that null (JS) gets translated to "" in python, NOT None.
// so we have to use undefined here
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
        newMovie['thumb'] = null; // the new movie should not have a thumb value yet!
        app.movies.push(newMovie);
        processMovies(); // ned to re-index the movies now that a new one has been added to thea array
    });
};

var handleThumbClick = function(movieIdx, newThumbState) {
    // if we call this function, and the thumb has the same value, we want to de-select it's 
    // so we set the new thumb state to null! (this translates to None in python)
    var jsThumbValue = newThumbState;
    var pythonThumbValue = newThumbState;
    if(app.movies[movieIdx].thumb == newThumbState) {
        jsThumbValue = null;
        pythonThumbValue = None; // remember, this is the global variable defined at the top. None == undefined
    }
    $.post('/moviesWithVue3/api/set_thumb/', { id: app.movies[movieIdx].id, thumb_state: pythonThumbValue }, function(response) {
        // after the web2py server responds, we know the thumb as been updated in the database
        // now, we just have to display the new thumb on the screen
        app.movies[movieIdx].thumb = jsThumbValue;
    });
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
        clickThumb: handleThumbClick
    }
});

onPageLoad();