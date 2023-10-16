'use strict'

class Workout{
 date = new Date();
  #id = Date.now();
  id = Date.now();

  constructor(coords , distance , duration){
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }

  _setdescription(){
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1).toLowerCase()} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`
  }


  get Id(){
    return this.#id;
  }
}

class Running extends Workout{
  type = 'running';

  constructor(coords ,distance , duration ,  cadence){
    super(coords ,distance , duration  );
    this.cadence = cadence;

    this._calcPace();
    this._setdescription();
  }

  _calcPace(){
    this.pace = +(this.duration / this.distance).toFixed(2);
    return this.pace;
  }

}


class Cycling extends Workout{
  type = 'cycling';


  constructor(distance , duration , coords , elevation){
    super(distance , duration , coords);
    this.elevation = elevation;

    this._calcSpeed();
    this._setdescription();
  }

  _calcSpeed(){
    this.speed = +(this.distance/this.duration).toFixed(2);
    return this.speed;
  }
}




const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form-input--type');
const inputDistance = document.querySelector('.form-input--distance');
const inputDuration = document.querySelector('.form-input--duration');
const inputCadence = document.querySelector('.form-input--cadence');
const inputElevation = document.querySelector('.form-input--elevation');

// const 


class app{
  #workouts = [];
  #map;
  #mapEvent;

   
  constructor(map) {
    this._getPosition();

    // get local storage
    // this._getLocalStorage();

// event listener
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change' , this.#toggleElevationField);
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this))
    // this.#map = map;
  }

  _getPosition(){

    if(navigator.geolocation)
    navigator.geolocation.getCurrentPosition(
      this.#loadMap.bind(this),
      function(){
        alert('couldn\'t get your position');
      })
  }

  #loadMap(position){

    // console.log(position);

    // load map ma kya krna ha ...
    const {latitude}  = position.coords;
    const {longitude } =  position.coords;
    const coords = [latitude, longitude];
    
  this.#map = L.map('map').setView(coords, 13);
  L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(this.#map);

  L.marker(coords).addTo(this.#map)
    .bindPopup({
          maxWidth: 300,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
    })
    .setPopupContent("\u2316Present Location")
    .openPopup();
    
    this._getLocalStorage();


  this.#map.on('click' , this._showForm.bind(this))  // its an event listener so we need to bind the this keyword in this 

  }

  _showForm(mapE){
    this.#mapEvent = mapE;
      form.classList.remove('hidden')
      this.setfocusField(inputDistance);
  }


  _hideForm() {
    // Empty inputs
    this.setAllFieldEmpty(inputCadence,inputDistance,inputDuration, inputElevation);
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }
  

  #toggleElevationField(){
    inputCadence.closest('.form-row').classList.toggle('form-row--hidden');
    inputElevation.closest('.form-row').classList.toggle('form-row--hidden');
    inputDistance.focus();
  }


  _newWorkout(e){
    // const validInputs = function(...values )
    //  {const boold = values.every(input => Number.isFinite(input));
    // return boold}

    const validInputs = (...values) => values.every(input => Number.isFinite(input))
    const allPositiveInput = (...values) => values.every(input => input > 0);

    e.preventDefault();
    
    // Get data from form4
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    let workout;

    const {lat , lng} = this.#mapEvent.latlng;
    console.log(lat , lng);

    // If workout running, create running object
    if(type === 'running'){

      const cadence = +inputCadence.value;

    if(!validInputs(distance, duration, cadence) ||
     !allPositiveInput(distance, duration, cadence)) 
        return alert(' provide right details.. ')

      console.log('validInputs');
      workout = new Running([lat, lng], distance, duration, cadence);
    }


    // If workout cycling, create cycling object
    if(type === 'cycling'){
      const elevation = +inputElevation.value;
  
      if(!validInputs(distance, duration, elevation) ||
       !allPositiveInput(distance, duration, elevation)) 
          return alert(' provide right details.. ')

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

   // clear inputfield
   this.setAllFieldEmpty(inputCadence,inputDistance,inputDuration, inputElevation);
      this.setfocusField(inputDistance);


    // Add new object to workout array
    this.#workouts.push(workout);

    // Render workout on map as mark
    this._renderWorkoutMarker(workout);
    console.log(workout);

    // Render workout on list
    this._renderWorkoutList(workout);

 // Hide form + clear input fields
 this._hideForm();
    
    // Set local storage to all workouts
    this._setLocalStorage();
  }

  _renderWorkoutMarker(workout ){
    L.marker(workout.coords).addTo(this.#map)
    .bindPopup(
      L.popup({
          maxWidth: 300,
          minWidth: 220,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
      })
    ).setPopupContent(` ${workout.type ==='running' ? '🏃‍♂️' : '🚴‍♀️'}${workout.description}`)
    .openPopup();
  } 


  _renderWorkoutList(workout){

    let html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
    <h2 class="workout-title">${workout.description}</h2>
    <div class="workout-details">
      <span class="workout-icon">🏃‍♂️</span>
      <span class="workout-value">${workout.distance}</span>
      <span class="workout-unit">km</span>
    </div>
    <div class="workout-details">
      <span class="workout-icon">⏱</span>
      <span class="workout-value">${workout.duration}</span>
      <span class="workout-unit">min</span>
    </div>
    `

    if (workout.type === 'running') {
      html += `
     <div class="workout-details">
      <span class="workout-icon">⚡️</span>
      <span class="workout-value">${workout.pace}</span>
      <span class="workout-unit">min/km</span>
    </div>

    <div class="workout-details">
      <span class="workout-icon">🦶🏼</span>
      <span class="workout-value">${workout.cadence}</span>
      <span class="workout-unit">spm</span>
    </div>
  </li>
  `
    }

    if (workout.type === 'cycling') {
      html += `
     <div class="workout-details">
      <span class="workout-icon">⚡️</span>
      <span class="workout-value">${workout.speed}</span>
      <span class="workout-unit">min/km</span>
    </div>

    <div class="workout-details">
      <span class="workout-icon">🦶🏼</span>
      <span class="workout-value">${workout.elevation}</span>
      <span class="workout-unit">spm</span>
    </div>
  </li>
  `
    }

    form.insertAdjacentHTML("afterend", html)
    
  }


  setfocusField(inputDistance){
    inputDistance.focus();
  };

  setAllFieldEmpty(...field) {
    field.forEach(input => input.value = '')
  };

  _moveToPopup(e){
     // BUGFIX: When we click on a workout before the map has loaded, we get an error. But there is an easy fix:
     if (!this.#map) return;

     const workoutClicked = e.target.closest('.workout');
     if (!workoutClicked) return;
    
    const workout = this.#workouts.find(
      work => 
         work.id === +workoutClicked.dataset.id
    );

    this.#map.setView(workout.coords , 13 , {
      animate: true,
      pan : {
        duration: 1,
      }
    })
 
  }


  _setLocalStorage(){
    localStorage.setItem('workout' , JSON.stringify(this.#workouts));
  }

  _getLocalStorage(){
    const data = JSON.parse(localStorage.getItem('workout'));
    if (!data) return;

    if (!this.#map) return;

    this.#workouts =data;
    this.#workouts.forEach(workout => {
      this._renderWorkoutList(workout);
      this._renderWorkoutMarker(workout);
    })
  }

  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }

}
const App = new app();

  
 