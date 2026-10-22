
const addExerciseButton = document.getElementById("addExerciseButton");
const cancelExerciseButton = document.getElementById("cancelExerciseButton");
const exerciseFormContainer = document.getElementById("exerciseFormContainer");
const exerciseForm = document.getElementById("exerciseForm");
const exerciseList = document.getElementById("exerciseList");

// Sample exercise data
const exercises = [
    {
        category: "Strength",
        name: "Bench Press",
        muscle: ["Chest", "Triceps"],
        equipment: ["Barbell", "Bench"],
        imageUrl: "",
        videoUrl: ""
    },
    {
        category: "Strength",
        name: "Squat",
        muscle: ["Legs", "Glutes"],
        equipment: ["Barbell"],
        imageUrl: "",
        videoUrl: ""
    },
    {
        category: "Strength",
        name: "Deadlift",
        muscle: ["Back", "Glutes", "Hamstrings"],
        equipment: ["Barbell"],
        imageUrl: "",
        videoUrl: ""
    },
    {
        category: "Strength",
        name: "Dumbbell Bicep Curl",
        muscle: ["Biceps"],
        equipment: ["Dumbbells"],
        imageUrl: "",
        videoUrl: ""
    }
];

// Open the form
addExerciseButton.addEventListener("click", function () {
    exerciseFormContainer.classList.remove("d-none");
});

// Close the form
cancelExerciseButton.addEventListener("click", function () {
    exerciseFormContainer.classList.add("d-none");
    exerciseForm.reset();
});

// Save a new exercise
exerciseForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Get the values from the form
    const newExercise = {
        category: document.getElementById("exerciseCategory").value,
        name: document.getElementById("exerciseName").value.trim(),

        muscle: document.getElementById("muscleGroup").value
            .split(",")
            .map(item => item.trim())
            .filter(item => item !== ""),

        equipment: document.getElementById("exerciseEquipment").value
            .split(",")
            .map(item => item.trim())
            .filter(item => item !== ""),

        imageUrl: document.getElementById("exerciseImage").value.trim(),
        videoUrl: document.getElementById("exerciseVideo").value.trim()
    };

    // Add the new exercise to the array
    exercises.push(newExercise);

    // Update the displayed exercise cards
    displayExercises();

    // Clear and close the form
    exerciseForm.reset();
    exerciseFormContainer.classList.add("d-none");
});

// Display all exercises
function displayExercises() {
    exerciseList.innerHTML = "";

    exercises.forEach(function (exercise) {
        const card = document.createElement("div");
        card.className = "col-md-6 col-lg-4";

        const cardBody = document.createElement("div");
        cardBody.className = "card h-100 shadow-sm";

        const body = document.createElement("div");
        body.className = "card-body";

        const title = document.createElement("h5");
        title.className = "card-title";
        title.textContent = exercise.name;

        const category = document.createElement("p");
        category.textContent = "Category: " + exercise.category;

        const muscles = document.createElement("p");
        muscles.textContent = "Muscles: " + exercise.muscle.join(", ");

        const equipment = document.createElement("p");
        equipment.textContent =
            "Equipment: " + exercise.equipment.join(", ");

        body.append(title, category, muscles, equipment);

        // Show an image if an image URL was provided
        if (exercise.imageUrl) {
            const image = document.createElement("img");
            image.src = exercise.imageUrl;
            image.alt = exercise.name;
            image.className = "img-fluid rounded mb-3";
            image.loading = "lazy";
            body.prepend(image);
        }

        // Show a video link if a video URL was provided
        if (exercise.videoUrl) {
            const videoLink = document.createElement("a");
            videoLink.href = exercise.videoUrl;
            videoLink.target = "_blank";
            videoLink.rel = "noopener noreferrer";
            videoLink.textContent = "Watch exercise video";
            videoLink.className = "d-block";

            body.appendChild(videoLink);
        }

        cardBody.appendChild(body);
        card.appendChild(cardBody);
        exerciseList.appendChild(card);
    });
}

// Display the sample exercises when the page loads
displayExercises();
