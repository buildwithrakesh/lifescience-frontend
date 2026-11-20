// Speed: these are resized copies (400px tall, ~50% smaller) of the originals in ../assets/shopbyanimals/.
// They are displayed at most ~125px tall (348px on 3x phones), so they look identical. Originals are kept unchanged.
import imgCow from "../assets/shopbyanimals/optimized/cow.webp";
import imgBuffalo from "../assets/shopbyanimals/optimized/Buffalo.webp";
import imgCock from "../assets/shopbyanimals/optimized/Cock.webp";
import imgDog from "../assets/shopbyanimals/optimized/Dog.webp";
import imgGoats from "../assets/shopbyanimals/optimized/Goats.webp";
import imgSheep from "../assets/shopbyanimals/optimized/Sheep.webp";
import imgFish from "../assets/shopbyanimals/optimized/Fish.webp";

export const animals = [
  { name: "Cow",        img: imgCow,         local: true,  note: "Everyday dairy & farm care" },
  { name: "Buffalo",    img: imgBuffalo,     local: true,  note: "Healthy, productive herds" },
  { name: "Cock",       img: imgCock,        local: true,  note: "Flock health essentials" },
  { name: "Dog",        img: imgDog,         local: true,  note: "Care for canine companions" },
  { name: "Goats",      img: imgGoats,       local: true,  note: "Small ruminant care" },
  { name: "Sheep",      img: imgSheep,       local: true,  note: "Support for every flock" },
  { name: "Fish",       img: imgFish,        local: true,  note: "Aquatic health solutions" }
];
