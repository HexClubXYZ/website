import { ensDataArray } from "https://hexclub.xyz/0xf-data.js";

const speechBubbleClose = document.querySelectorAll(".speech-bubble-close");
const speechBubbleRight = document.querySelector(".speech-bubble-right");
const tbody = document.querySelector("tbody");
const thead = document.querySelector("thead");
const th = document.querySelectorAll("thead th");
const err = document.querySelector(".err");

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

ensDataArray.forEach((ensData) => {
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
	let currentPrice = ensData?.data?.orders[0]?.current_price;
	let decimal = ensData?.data?.orders[0]?.payment_token_contract?.decimals;
	if (decimal) {
		decimal = Number(decimal);
	}
	if (currentPrice) {
		currentPrice = Number(currentPrice);
		let divider = getDivider(decimal);
		currentPrice = currentPrice / divider;
	}
	cell.innerHTML = currentPrice ? Number(currentPrice) : "";

	cell = row.insertCell();
	cell.innerHTML = ensData.data.num_sales;

	cell = row.insertCell();
	const owner = ensData.data?.owner?.user?.username;
	cell.innerHTML = owner ? owner : "";

	cell = row.insertCell();
	let address = ensData?.data?.owner?.address;
	cell.innerHTML = address ? address.substr(0, 5) : "";
	cell.title = address;

	cell = row.insertCell();
	let tokenId = ensData?.data?.token_id;
	cell.innerHTML = tokenId ? tokenId.substr(0, 5) : "";
	cell.title = tokenId;

	cell = row.insertCell();
	let topBid = ensData?.data?.top_bid;

	cell.innerHTML = topBid;
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
		/** Remember:
		 * We obtained all tr elements that has 'order' class before!
		 * However, querySelectorAll returns a NodeList, not an Array.
		 * While forEach method can be used on NodeLists, filter method cannot.
		 * This is why we preferred to make this conversion below; where we actually need an array to filter.
		 * Note: NoteList is very similar to array and easy to convert.
		 **/
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
