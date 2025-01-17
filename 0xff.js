import { data } from "https://hexclub.xyz/0xff-data.js";

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

ensDataArray = ensDataArray.sort((a, b) => {
	if (a.currentPrice === b.currentPrice) {
		return 0;
	} else if (a.currentPrice === null) {
		return 1;
	} else if (b.currentPrice === null) {
		return -1;
	} else {
		return a.currentPrice < b.currentPrice ? -1 : 1;
	}
});

ensDataArray.forEach((ensData) => {
	let row = tbody.insertRow(-1);
	row.className = "order";

	let cell = row.insertCell();
	cell.innerHTML =
		'<a href="' +
		ensData.permalink +
		'" target="_blank">' +
		ensData.name +
		" </a>";
	cell = row.insertCell();

	cell.innerHTML = ensData.currentPrice ? ensData.currentPrice : "";

	cell = row.insertCell();

	cell.innerHTML = ensData.highestOffer ? ensData.highestOffer : "";

	cell = row.insertCell();

	cell.innerHTML = ensData.lastSellPrice ? ensData.lastSellPrice : "";

	cell = row.insertCell();
	cell.innerHTML = ensData.numSales;

	cell = row.insertCell();
	const owner = ensData.data?.owner?.user?.username;
	let address = ensData?.data?.owner?.address;
	cell.innerHTML = ensData.owner
		? `<a href="https://opensea.io/${ensData.address}" target="_blank">${ensData.owner}`
		: `<a href="https://opensea.io/${
				ensData.address
		  }" target="_blank">${ensData.address.substr(0, 5)}`;
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
				let aValue = a.childNodes[idx].innerHTML;
				let bValue = b.childNodes[idx].innerHTML;
				// return a.childNodes[idx].innerHTML.localeCompare(
				// 	b.childNodes[idx].innerHTML,
				// 	"en",
				// 	{ numeric: true, sensitivity: "base" }
				// );

				if (aValue === bValue) {
					return 0;
				} else if (aValue === "") {
					return 1;
				} else if (bValue === "") {
					return -1;
				} else if (sortDirection) {
					return Number(aValue) < Number(bValue) ? -1 : 1;
				} else {
					return Number(aValue) < Number(bValue) ? 1 : -1;
				}
			})
			.forEach((row) => {
				tbody.insertBefore(row, tbody.childNodes[tbody.length]);
				// sortDirection
				// 	? tbody.insertBefore(row, tbody.childNodes[tbody.length])
				// 	: tbody.insertBefore(row, tbody.childNodes[0]);
			});
	});
});
