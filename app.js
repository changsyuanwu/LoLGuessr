const numOptions = 4;
let score = 0;
const winScore = 5;
const scoreTiers = {
  Iron: 5,
  Bronze: 10,
  Silver: 15,
  Gold: 20,
  Platinum: 25,
  Diamond: 30,
  Master: 35,
  Grandmaster: 40,
  Challenger: 50,
};

const manualNameCorrections = async (champNames) => {
  const nameCorrections = {
    Fiddlesticks: "FiddleSticks",
  };

  champNames.map((name) => {
    name = nameCorrections[name];
  });

  return champNames;
};

const getChampionNames = async () => {
  const url =
    "https://ddragon.leagueoflegends.com/cdn/11.23.1/data/en_US/champion.json";
  const res = await fetch(url);
  const json = await res.json();
  return Object.keys(json.data);
};

async function getRandomChampions() {
  const champNames = await getChampionNames();
  let champs = [];
  while (champs.length < numOptions) {
    const randChamp = champNames[Math.floor(Math.random() * champNames.length)];
    if (!champs.includes(randChamp)) {
      champs.push(randChamp);
    }
  }
  return champs;
}

const getChampionJson = async (champName) => {
  const url = `https://ddragon.leagueoflegends.com/cdn/11.23.1/data/en_US/champion/${champName}.json`;
  const res = await fetch(url);
  const json = await res.json();
  return json.data[champName];
};

const getRandomImageType = async () => {
  const imageTypes = ["centered", "loading", "tiles"];
  return imageTypes[Math.floor(Math.random() * imageTypes.length)];
};

const getChampionImage = async (champName, skinNum) => {
  let img = new Image();
  const imageType = await getRandomImageType();
  const url = `https://ddragon.leagueoflegends.com/cdn/img/champion/${imageType}/${champName}_${skinNum}.jpg`;
  const imgCard = document.querySelector("#img-card");
  imgCard.append(img);
  img.src = url;
  img.classList.add("h-100");
};

const run = async () => {
  const champNames = await getRandomChampions()
  const champs = await manualNameCorrections(champNames);
  
  const correctChampName = champs[Math.floor(Math.random() * champs.length)];
  const json = await getChampionJson(correctChampName);
  const skins = json.skins;
  const randSkinObj = skins[Math.floor(Math.random() * skins.length)];
  await getChampionImage(correctChampName, randSkinObj.num);

  const btn_wrapper = document.getElementById("btn-wrapper");

  champs.forEach((champ) => {
    const btn = document.createElement("button");
    btn.classList.add("btn", "btn-info", "w-100", "my-2", "option-btn");
    btn.textContent = champ;

    if (champ === correctChampName) {
      btn.id = "correct";
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
      if (btn.id === "correct") {
        score++;
        if (score === winScore) {
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

run();

const resetState = async () => {
  const scoreSpan = document.getElementById("score");
  const btn_wrapper = document.getElementById("btn-wrapper");
  const imgCard = document.querySelector("#img-card");
  const resultRank = document.getElementById("result-rank");
  const instructions = document.getElementById("instructions");
  btn_wrapper.innerHTML = "";
  imgCard.innerHTML = "";
  scoreSpan.textContent = score;
  resultRank.innerHTML = "";
  instructions.innerHTML = "";
};

const win = async () => {
  const btn_wrapper = document.getElementById("btn-wrapper");
  const instructions = document.getElementById("instructions");
  const restart = document.createElement("button");
  const continuePlaying = document.createElement("button");

  await generateResultsScreen("Challenger");

  instructions.textContent =
    "You can now choose to climb again or continue playing.";

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
  const resultMessages = {
    Iron: `Yikes! You only got a score of <span class="text-success">${score}</span>! You're in the bottom 1% of players...`,
    Bronze: `Oof! You only got <span class="text-success">${score}</span> right! At least you're not Iron...`,
    Silver: `Not bad! You got <span class="text-success">${score}</span> correct! You scored similarly to the average player!`,
    Gold: `Good job! You got <span class="text-success">${score}</span> correct! You are better than 59% of all players!`,
    Platinum: `Great job! You got <span class="text-success">${score}</span> right! You've reached Skilled tier and are in the top 10% of players now!`,
    Diamond: `Well done! You managed to get <span class="text-success">${score}</span> correct! You're in the top 2% of players!`,
    Master: `Way to go! You managed to get <span class="text-success">${score}</span> correct! You've reached Elite tier and are in the top 0.3% of players now!`,
    Grandmaster: `Fantastic! You managed to get <span class="text-success">${score}</span> correct! You're one of the top 1000 players now!`,
    Challenger: `Congratulations! You managed to get <span class="text-success">${score}</span> correct! Either this quiz is too easy or you play too much League!`,
  };

  const imgCard = document.querySelector("#img-card");
  const scoreSpan = document.getElementById("score");
  const resultRank = document.getElementById("result-rank");

  imgCard.innerHTML = `
            <img src="images/rank_emblems/${tier}.png" class="h-100" />
             <h5 class="text-center text-light">
                ${resultMessages[tier]}
            </h5>
        `;

  scoreSpan.textContent = score;
  resultRank.textContent = `Your rank is ${tier}`;
};

const lose = async () => {
  const btn_wrapper = document.getElementById("btn-wrapper");
  const restart = document.createElement("button");

  if (score <= scoreTiers.Iron) {
    await generateResultsScreen("Iron");
  } else if (score <= scoreTiers.Bronze) {
    await generateResultsScreen("Bronze");
  } else if (score <= scoreTiers.Silver) {
    await generateResultsScreen("Silver");
  } else if (score <= scoreTiers.Gold) {
    await generateResultsScreen("Gold");
  } else if (score <= scoreTiers.Platinum) {
    await generateResultsScreen("Platinum");
  } else if (score <= scoreTiers.Diamond) {
    await generateResultsScreen("Diamond");
  } else if (score <= scoreTiers.Master) {
    await generateResultsScreen("Master");
  } else if (score <= scoreTiers.Grandmaster) {
    await generateResultsScreen("Grandmaster");
  } else {
    await generateResultsScreen("Challenger");
  }

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
