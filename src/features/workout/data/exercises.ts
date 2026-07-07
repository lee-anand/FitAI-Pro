import type { Exercise } from "../../../types/exercise";

export const exercises: Exercise[] = [
  {
    id: "push-up",
    name: "Push Up",
    category: "Upper Body",
    targetMuscles: ["Chest", "Triceps", "Shoulders"],
    difficulty: "Beginner",
    caloriesPerMinute: 7,
    aiCompatible: true,
    description:
      "A bodyweight pressing exercise that develops upper-body strength and core stability.",
    instructions: [
      "Start in a high plank position.",
      "Keep your body in a straight line.",
      "Lower your chest by bending your elbows.",
      "Push through your palms to return to the starting position.",
    ],
    commonMistakes: [
      "Allowing the hips to sag.",
      "Flaring the elbows excessively.",
      "Performing incomplete repetitions.",
    ],
  },
  {
    id: "diamond-push-up",
    name: "Diamond Push Up",
    category: "Upper Body",
    targetMuscles: ["Triceps", "Chest", "Shoulders"],
    difficulty: "Intermediate",
    caloriesPerMinute: 8,
    aiCompatible: true,
    description:
      "A push-up variation that places greater emphasis on the triceps.",
    instructions: [
      "Begin in a high plank position.",
      "Place your hands close together beneath your chest.",
      "Lower your body under control.",
      "Extend your arms to return to the starting position.",
    ],
    commonMistakes: [
      "Placing the hands too far forward.",
      "Allowing the lower back to arch.",
      "Using a shortened range of motion.",
    ],
  },
  {
    id: "pike-push-up",
    name: "Pike Push Up",
    category: "Upper Body",
    targetMuscles: ["Shoulders", "Triceps"],
    difficulty: "Intermediate",
    caloriesPerMinute: 8,
    aiCompatible: true,
    description:
      "A bodyweight shoulder exercise that develops vertical pressing strength.",
    instructions: [
      "Start in a high plank position.",
      "Raise your hips into an inverted V position.",
      "Lower your head toward the floor.",
      "Push back to the starting position.",
    ],
    commonMistakes: [
      "Dropping the hips.",
      "Moving forward instead of downward.",
      "Using an incomplete range of motion.",
    ],
  },
  {
    id: "bodyweight-squat",
    name: "Bodyweight Squat",
    category: "Lower Body",
    targetMuscles: ["Quadriceps", "Glutes", "Hamstrings"],
    difficulty: "Beginner",
    caloriesPerMinute: 8,
    aiCompatible: true,
    description:
      "A fundamental lower-body movement for developing leg strength and mobility.",
    instructions: [
      "Stand with your feet around shoulder-width apart.",
      "Brace your core and begin sitting your hips back.",
      "Bend your knees and lower under control.",
      "Drive through your feet to return to standing.",
    ],
    commonMistakes: [
      "Allowing the knees to collapse inward.",
      "Lifting the heels from the floor.",
      "Failing to maintain a stable torso.",
    ],
  },
  {
    id: "reverse-lunge",
    name: "Reverse Lunge",
    category: "Lower Body",
    targetMuscles: ["Quadriceps", "Glutes", "Hamstrings"],
    difficulty: "Beginner",
    caloriesPerMinute: 7,
    aiCompatible: true,
    description:
      "A unilateral lower-body exercise for developing strength, balance, and coordination.",
    instructions: [
      "Stand upright with your feet hip-width apart.",
      "Step one leg backward.",
      "Lower both knees under control.",
      "Push through the front foot and return to standing.",
    ],
    commonMistakes: [
      "Taking a step that is too short.",
      "Allowing the front knee to collapse inward.",
      "Losing balance by moving too quickly.",
    ],
  },
  {
    id: "glute-bridge",
    name: "Glute Bridge",
    category: "Lower Body",
    targetMuscles: ["Glutes", "Hamstrings"],
    difficulty: "Beginner",
    caloriesPerMinute: 5,
    aiCompatible: true,
    description:
      "A hip-extension exercise for strengthening the glutes and posterior chain.",
    instructions: [
      "Lie on your back with your knees bent.",
      "Place your feet flat on the floor.",
      "Drive through your heels and raise your hips.",
      "Lower your hips under control.",
    ],
    commonMistakes: [
      "Overarching the lower back.",
      "Pushing through the toes.",
      "Failing to fully extend the hips.",
    ],
  },
  {
    id: "plank",
    name: "Plank",
    category: "Core",
    targetMuscles: ["Abdominals", "Obliques", "Lower Back"],
    difficulty: "Beginner",
    caloriesPerMinute: 4,
    aiCompatible: true,
    description:
      "An isometric core exercise that develops trunk stability and postural control.",
    instructions: [
      "Place your forearms on the floor.",
      "Extend your legs behind you.",
      "Brace your core.",
      "Maintain a straight body position.",
    ],
    commonMistakes: [
      "Allowing the hips to sag.",
      "Raising the hips excessively.",
      "Holding the breath.",
    ],
  },
  {
    id: "mountain-climber",
    name: "Mountain Climber",
    category: "Core",
    targetMuscles: ["Abdominals", "Hip Flexors", "Shoulders"],
    difficulty: "Intermediate",
    caloriesPerMinute: 10,
    aiCompatible: true,
    description:
      "A dynamic core exercise that combines trunk stability with cardiovascular conditioning.",
    instructions: [
      "Begin in a high plank position.",
      "Brace your core.",
      "Drive one knee toward your chest.",
      "Alternate legs while maintaining a stable torso.",
    ],
    commonMistakes: [
      "Raising the hips excessively.",
      "Bouncing through repetitions.",
      "Losing shoulder stability.",
    ],
  },
  {
    id: "bicycle-crunch",
    name: "Bicycle Crunch",
    category: "Core",
    targetMuscles: ["Abdominals", "Obliques"],
    difficulty: "Intermediate",
    caloriesPerMinute: 7,
    aiCompatible: true,
    description:
      "A rotational core exercise targeting the abdominals and obliques.",
    instructions: [
      "Lie on your back and place your hands behind your head.",
      "Raise your shoulders from the floor.",
      "Bring one knee toward the opposite elbow.",
      "Alternate sides under control.",
    ],
    commonMistakes: [
      "Pulling on the neck.",
      "Moving too quickly.",
      "Using momentum instead of controlled rotation.",
    ],
  },
];