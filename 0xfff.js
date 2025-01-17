import { data } from "https://hexclub.xyz/0xfff-data.js";

let ensDataArray = data.urlArray;
let updateDate = data.updateDate;

const speechBubbleClose = document.querySelectorAll(".speech-bubble-close");
const speechBubbleRight = document.querySelector(".speech-bubble-right");
const tbody = document.querySelector("tbody");
const thead = document.querySelector("thead");
const th = document.querySelectorAll("thead th");
const err = document.querySelector(".err");
document.getElementById("update_date").textContent = updateDate;

// SPEECH BUBBLES
speechBubbleClose.forEach((i) => {
	i.addEventListener("click", () => {
		i.parentElement.remove();
	});
});

function getDivider(decimal) {
	let divider = "1";
	for (let i = 0; i < decimal; i++) {
		divider += "0";
	}
	divider = Number(divider);
	return divider;
}

// speechBubbleRight.addEventListener("mouseover", () => {
// 	if (!thead.classList.contains("thead-flash-once")) {
// 		thead.classList.add("thead-flash-once");
// 	}
// });

// speechBubbleRight.addEventListener("mouseout", () => {
// 	if (thead.classList.contains("thead-flash-once")) {
// 		thead.classList.remove("thead-flash-once");
// 	}
// });

// SORT data ;
function getCurrentPrice(ensData) {
	let orders = ensData?.data?.orders;
	let currentPrice = null;
	let decimal = null;
	if (orders && orders.length) {
		currentPrice = orders[0].current_price;
		decimal = orders[0].payment_token_contract?.decimals;
	}
	if (decimal) {
		decimal = Number(decimal);
	}
	if (currentPrice) {
		currentPrice = Number(currentPrice);
		let divider = getDivider(decimal);
		currentPrice = currentPrice / divider;
	}
	return currentPrice;
}

ensDataArray = ensDataArray.sort((a, b) => {
	let aCurrentPrice = getCurrentPrice(a);

	let bCurrentPrice = getCurrentPrice(b);
	return aCurrentPrice - bCurrentPrice;
});

ensDataArray.forEach((ensData) => {
	const unregistered = ensData.unregistered;
	//console.log(`unregistered ${unregistered}`);
	if (unregistered === false) {
		let row = tbody.insertRow(-1);
		row.className = "order";

		let cell = row.insertCell();
		cell.innerHTML =
			'<a href="' +
			ensData.data.permalink +
			'" target="_blank">' +
			ensData.name +
			" </a>";
		cell = row.insertCell();

		let currentPrice = getCurrentPrice(ensData);

		cell.innerHTML = currentPrice ? Number(currentPrice) : "";

		cell = row.insertCell();
		cell.innerHTML = ensData.data.num_sales;

		cell = row.insertCell();
		const owner = ensData.data?.owner?.user?.username;
		let address = ensData?.data?.owner?.address;
		cell.innerHTML = owner
			? `<a href="https://opensea.io/${address}" target="_blank">${owner}`
			: `<a href="https://opensea.io/${address}" target="_blank">${address.substr(
					0,
					5
			  )}`;
		cell = row.insertCell();
		cell.innerHTML = "Registered";
	} else {
		let row = tbody.insertRow(-1);
		row.className = "order";
		let cell = row.insertCell();
		cell = row.insertCell();
		cell = row.insertCell();
		cell = row.insertCell();
		cell = row.insertCell();
		cell.innerHTML = "Unregistered";
	}
});

// FILTER
let filterInput = document.querySelector(".filter-input");
const order = document.querySelectorAll(".order");

filterInput.addEventListener("keyup", () => {
	let criteria = filterInput.value.toUpperCase().trim();
	let j = 0;

	order.forEach((data) => {
		thead.style.opacity = "1";
		err.style.display = "";
		//speechBubbleRight.style.visibility = "";
		if (data.innerText.toUpperCase().indexOf(criteria) > -1) {
			data.style.display = "";
		} else {
			data.style.display = "none";
			j++;
			if (j === order.length) {
				thead.style.opacity = "0.2";
				err.style.display = "flex";
				//speechBubbleRight.style.visibility = "hidden";
			}
		}
	});
});

// SORT
let sortDirection;

th.forEach((col, idx) => {
	col.addEventListener("click", () => {
		sortDirection = !sortDirection;
		const rowsArrFromNodeList = Array.from(order);
		const filteredRows = rowsArrFromNodeList.filter(
			(item) => item.style.display != "none"
		);

		filteredRows
			.sort((a, b) => {
				return a.childNodes[idx].innerHTML.localeCompare(
					b.childNodes[idx].innerHTML,
					"en",
					{ numeric: true, sensitivity: "base" }
				);
			})
			.forEach((row) => {
				sortDirection
					? tbody.insertBefore(row, tbody.childNodes[tbody.length])
					: tbody.insertBefore(row, tbody.childNodes[0]);
			});
	});
});
