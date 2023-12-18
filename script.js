document.addEventListener('DOMContentLoaded', function() {

  fetch('http://localhost:3000/getPoints')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch points');
      }
      return response.json();
    })
    .then(data => {
      console.log('Points retrieved from the server:', data);
      const pointsArray = data;
      const pointsList = document.getElementById('pointsList');

      pointsArray.forEach(point => {
        const listItem = document.createElement('li');
        if (point.points <= 6) {
          document.getElementById(`circle${point.points}`).classList.add('clicked');
        }
        listItem.textContent = `Point: ${point.points} `;
        pointsList.appendChild(listItem);
      });
    })
    .catch(error => {
      console.error('Error:', error);
    });

  function savePointsIndb(points) {
    const data = { points: points };
    fetch('http://localhost:3000/storePoints/' + points, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to send points to the server');
        }
        return response.text();
      })
      .then(result => {
        console.log('Points sent successfully:', result);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  function resetDatabase() {
    fetch('http://localhost:3000/resetDatabase', {
        method: 'POST',
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to reset the database');
        }
        return response.text();
      })
      .then(result => {
        console.log('Database reset successful:', result);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  function updateTimer() {
    let seconds = 120;
    const timerElement = document.getElementById('timer');

    const timerInterval = setInterval(() => {
      seconds--;
      if (seconds >= 0) {
        timerElement.textContent = seconds;
      } else {
        clearInterval(timerInterval);
        resetDatabase();
      }
    }, 1000);
  }

  const resetButton = document.getElementById('resetButton');
  resetButton.addEventListener('click', () => {
    resetDatabase();
  });

  updateTimer();

  const circles = document.querySelectorAll('.ring');
  let lastClickedId = null;
  let debounceTimeout;

  const beepSound = document.getElementById('beepSound');
  circles.forEach(circle => {
    circle.addEventListener('mouseenter', function(event) {
      const hoveredId = event.target.id;
      this.classList.add('hovered');
      removeLowerHoveredIds(hoveredId);
    });

    circle.addEventListener('mouseleave', function() {
      removeAndAddHovered();
    });

    circle.addEventListener('click', function(event) {
      beepSound.currentTime = 0;
      beepSound.play();
      debounceTimeout = setTimeout(() => {
        lastClickedId = null;
      }, 1000);

      const clickedId = event.target.id;
      if (lastClickedId !== clickedId) {
        lastClickedId = clickedId;
        if (debounceTimeout) {
          clearTimeout(debounceTimeout);
        }
        if (this.classList.contains('center')) {
          // alert('Clicked on center');
        } else {
          if (clickedId == '') {
            alert(`You have 8 points`);
            savePointsIndb(8);
          } else {
            for (let i = 1; i <= 6; i++) {
              if (clickedId === document.getElementById(`circle${i}`).id) {
                alert(`You have ${i} points`);
                savePointsIndb(i);
                document.getElementById(`circle${i}`).classList.add('clicked');
              }
            }
          }
        }
        debounceTimeout = setTimeout(() => {
          lastClickedId = null;
        }, 1000);
      }
    });
  });

  function removeLowerHoveredIds(id) {
    const idNumber = parseInt(id.replace('circle', ''), 10);

    for (let i = 1; i < idNumber; i++) {
      const elementToRemove = document.getElementById(`circle${i}`);
      if (elementToRemove) {
        elementToRemove.classList.remove('hovered');
      }
    }
  }

  function removeAndAddHovered() {
    let id;
    let hovered = document.querySelectorAll('.hovered');

    hovered.forEach(element => {
      id = element.id;
      element.classList.remove('hovered');
    });

    for (let i = 1; i <= 6; i++) {
      if (id === document.getElementById(`circle${i}`).id) {
        const newID = `circle${i - 1}`;
        const elementToHover = document.getElementById(newID);
        if (elementToHover) {
          elementToHover.classList.add('hovered');
        }
      }
    }
  }

  document.addEventListener('click', function(event) {
    const clickedInsideCircle = event.target.closest('.ring');

    if (!clickedInsideCircle) {
      beepSound.currentTime = 0;
      beepSound.play();
      debounceTimeout = setTimeout(() => {
        lastClickedId = null;
      }, 1000);
      alert('You are clicking outside the circles.');
    }
  });
});
