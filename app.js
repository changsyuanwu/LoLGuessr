const numOptions = 4;
let score = 0;
let latestGameVersion = "14.21.1";
let correctOptionNumber = 0;
const resultTiers = {
  Iron: {
    score: 17, // This is the highest score within this tier
    message: `Yikes! You only got a score of ${score}! Someone needs to play more League of Legends...`,
  },
  Bronze: {
    score: 35,
    message: `Oof! You only got ${score} right! At least you're not Iron...`,
  },
  Silver: {
    score: 55,
    message: `Not bad! You got ${score} correct! You scored similarly to the average player!`,
  },
  Gold: {
    score: 72,
    message: `Good job! You got ${score} correct! You're in the top half of all players!`,
  },
  Platinum: {
    score: 85,
    message: `Great job! You got ${score} right! You are in the top quarter of all players!`,
  },
  Emerald: {
    score: 94,
    message: `Well done! You managed to get ${score} correct! You're in the top 15% of all players!`,
  },
  Diamond: {
    score: 97,
    message: `Way to go! You managed to get ${score} correct! You are in the top 5% of all players now!`,
  },
  Master: {
    score: 98,
    message: `Fantastic! You managed to get ${score} correct! You're good enough to go professional!`,
  },
  Grandmaster: {
    score: 99,
    message: `Amazing! You managed to get ${score} correct! You're in the top 0.5% of players but just a hair away from perfect!`,
  },
  Challenger: {
    score: 100,
    message: `Congratulations! You managed to get ${score} correct! You've aced this quiz! Either this quiz is too easy or you play too much League!`,
  },
};
const recentChampions = [];

const manualSkinAssetNameCorrections = (champName) => {
  const nameCorrections = {
    Fiddlesticks: "FiddleSticks",
  };

  if (nameCorrections.hasOwnProperty(champName)) {
    return nameCorrections[champName];
  }

  return champName;
};

const manualDisplayNameCorrections = (champName) => {
  const nameCorrections = {
    Belveth: "Bel'Veth",
    Chogath: "Cho'Gath",
    DrMundo: "Dr. Mundo",
    JarvanIV: "Jarvan IV",
    Kaisa: "Kai'Sa",
    Khazix: "Kha'Zix",
    KogMaw: "Kog'Maw",
    KSante: "K'Sante",
    Leblanc: "LeBlanc",
    Nunu: "Nunu & Willump",
    RekSai: "Rek'Sai",
    Renata: "Renata Glasc",
    Velkoz: "Vel'Koz",
    MonkeyKing: "Wukong",
  };

  if (nameCorrections.hasOwnProperty(champName)) {
    return nameCorrections[champName];
  }

  // Insert space before capital letters
  return champName.replace(/([A-Z])/g, " $1").trim();
};

const getLatestGameVersion = async () => {
  const url = "https://ddragon.leagueoflegends.com/api/versions.json";
  const res = await fetch(url);
  const json = await res.json();
  return json[0];
};

const getChampionNames = async () => {
  const url = `https://ddragon.leagueoflegends.com/cdn/${latestGameVersion}/data/en_US/champion.json`;
  const res = await fetch(url);
  const json = await res.json();
  return Object.keys(json.data);
};

const getRandomChampions = async () => {
  const champNames = await getChampionNames();
  let champs = [];
  while (champs.length < numOptions) {
    const randChamp = champNames[Math.floor(Math.random() * champNames.length)];
    // Ensure no duplicate or recent champions
    // This also prevents recent skins from showing up
    if (!champs.includes(randChamp) && !recentChampions.includes(randChamp)) {
      champs.push(randChamp);
      recentChampions.push(randChamp);
      // The 40 most recent champions cannot be selected (last 10 rounds)
      if (recentChampions.length >= 40) {
        recentChampions.shift();
      }
    }
  }
  return champs;
};

const getChampionJson = async (champName) => {
  const url = `https://ddragon.leagueoflegends.com/cdn/${latestGameVersion}/data/en_US/champion/${champName}.json`;
  const res = await fetch(url);
  const json = await res.json();
  return json.data[champName];
};

const getRandomImageType = () => {
  const imageTypes = ["centered", "loading", "tiles"];
  return imageTypes[Math.floor(Math.random() * imageTypes.length)];
};

const getChampionImageUrl = (champName, skinNum) => {
  const imageType = getRandomImageType();
  const url = `https://ddragon.leagueoflegends.com/cdn/img/champion/${imageType}/${champName}_${skinNum}.jpg`;
  return url;
};

const showImage = async (imageUrl) => {
  const img = new Image();
  const imgCard = document.querySelector("#img-card");
  imgCard.append(img);
  img.src = imageUrl;
  img.classList.add("h-100");
}

const run = async () => {
  latestGameVersion = await getLatestGameVersion();
  const champs = await getRandomChampions();
  const correctChampName = champs[Math.floor(Math.random() * champs.length)];
  const json = await getChampionJson(correctChampName);
  const skins = json.skins;
  const randSkinObj = skins[Math.floor(Math.random() * skins.length)];
  const champImageUrl = getChampionImageUrl(
    manualSkinAssetNameCorrections(correctChampName),
    randSkinObj.num
  );
  showImage(champImageUrl);

  const btn_wrapper = document.getElementById("btn-wrapper");

  champs.forEach((champ, index) => {
    const btn = document.createElement("button");
    btn.classList.add("btn", "btn-info", "w-100", "my-2", "option-btn");
    btn.textContent = manualDisplayNameCorrections(champ);
    btn.id = index;

    if (champ === correctChampName) {
      correctOptionNumber = index;
    }

    const content = `
            <div class="col-sm-6 col-md-4 col-lg-3">
                ${btn.outerHTML}
            </div>
        `;
    btn_wrapper.insertAdjacentHTML("afterbegin", content);
  });

  const btns = document.querySelectorAll(".option-btn");

  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (parseInt(btn.id) === correctOptionNumber) {
        score++;
        if (score === resultTiers.Challenger.score) {
          win();
        } else {
          correct();
        }
      } else {
        lose();
      }
    });
  });
};

const updateHighscore = async () => {
  const highscoreSpan = document.getElementById("highscore-span");
  const currentHighscore = localStorage.getItem("highscore");
  if (currentHighscore === "" || currentHighscore < score) {
    localStorage.setItem("highscore", score);
  }
  highscoreSpan.textContent = localStorage.getItem("highscore");
};

const resetState = async () => {
  const scoreSpan = document.getElementById("score-span");
  const btn_wrapper = document.getElementById("btn-wrapper");
  const imgCard = document.querySelector("#img-card");
  const resultRank = document.getElementById("result-rank");
  const instructions = document.getElementById("instructions");
  const resultMessage = document.getElementById("result-message");

  scoreSpan.textContent = score;
  btn_wrapper.innerHTML = "";
  imgCard.innerHTML = "";
  resultRank.innerHTML = "";
  instructions.innerHTML = "";
  resultMessage.innerHTML = "";
};

const win = async () => {
  const btn_wrapper = document.getElementById("btn-wrapper");
  const instructions = document.getElementById("instructions");
  const restart = document.createElement("button");
  const continuePlaying = document.createElement("button");

  await generateResultsScreen("Challenger");

  instructions.textContent =
    "You can now choose to climb again or continue playing in endless mode.";

  continuePlaying.classList.add(
    "btn",
    "btn-success",
    "my-2",
    "w-45",
    "mx-auto"
  );
  continuePlaying.textContent = "Continue Playing";
  continuePlaying.addEventListener("click", async () => {
    await resetState();
    run();
  });

  restart.classList.add("btn", "btn-success", "my-2", "w-45", "mx-auto");
  restart.textContent = "Try Again";
  restart.addEventListener("click", async () => {
    score = 0;
    await resetState();
    run();
  });

  btn_wrapper.innerHTML = "";
  btn_wrapper.append(restart);
  btn_wrapper.append(continuePlaying);
};

const correct = async () => {
  await resetState();
  run();
};

const generateResultsScreen = async (tier) => {

  const imgCard = document.querySelector("#img-card");
  const scoreSpan = document.getElementById("score-span");
  const resultRank = document.getElementById("result-rank");
  const resultMessage = document.getElementById("result-message");

  imgCard.innerHTML = "";
  showImage(`images/rank_emblems/${tier}.webp`);
  resultMessage.textContent = resultTiers[tier].message;
  scoreSpan.textContent = score;
  resultRank.textContent = `Your rank is ${tier}`;
};

const lose = async () => {
  const btn_wrapper = document.getElementById("btn-wrapper");
  const restart = document.createElement("button");

  if (score <= resultTiers.Iron.score) {
    await generateResultsScreen("Iron");
  } else if (score <= resultTiers.Bronze.score) {
    await generateResultsScreen("Bronze");
  } else if (score <= resultTiers.Silver.score) {
    await generateResultsScreen("Silver");
  } else if (score <= resultTiers.Gold.score) {
    await generateResultsScreen("Gold");
  } else if (score <= resultTiers.Platinum.score) {
    await generateResultsScreen("Platinum");
  } else if (score <= resultTiers.Emerald.score) {
    await generateResultsScreen("Emerald");
  } else if (score <= resultTiers.Diamond.score) {
    await generateResultsScreen("Diamond");
  } else if (score <= resultTiers.Master.score) {
    await generateResultsScreen("Master");
  } else if (score <= resultTiers.Grandmaster.score) {
    await generateResultsScreen("Grandmaster");
  } else {
    await generateResultsScreen("Challenger");
  }

  await updateHighscore();

  restart.classList.add("btn", "btn-success", "my-2", "w-50", "mx-auto");
  restart.textContent = "Try Again";
  restart.addEventListener("click", async () => {
    score = 0;
    await resetState();
    run();
  });

  btn_wrapper.innerHTML = "";
  btn_wrapper.append(restart);
};

const clickCorrespondingBtn = async (btnId) => {
  const optionBtns = document.getElementsByClassName("option-btn");
  const correspondingBtn = optionBtns.namedItem(btnId);
  correspondingBtn.click();
}

const handleKeyUp = async (e) => {
  switch (e.key) {
    case "1":
      clickCorrespondingBtn("3");
      break;
    case "2":
      clickCorrespondingBtn("2");
      break;
    case "3":
      clickCorrespondingBtn("1");
      break;
    case "4":
      clickCorrespondingBtn("0");
      break;
  }
};

const addKeyupListener = async () => {
  document.addEventListener("keyup", handleKeyUp);
}

updateHighscore();
run();
addKeyupListener();