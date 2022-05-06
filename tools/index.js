require("dotenv").config();
const Web3 = require("web3");
const axios = require("axios");
const web3 = new Web3(
	`https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`
);
const sdk = require("api")("@opensea/v1.0#5zrwe3ql2r2e6mn");
const fs = require("fs");
const moment = require("moment-timezone");
const OPENSEA_API_KEY = process.env.OPENSEA_API_KEY;
sdk.auth(OPENSEA_API_KEY);

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

let delayAfterEveryAPICall = process.env.DELAY_SECONDS;
if (!delayAfterEveryAPICall) delayAfterEveryAPICall = 250;

const contractAddress = "0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85";

async function getEventsFromOpenSea(tokenId, contractAddress, eventType) {
	return new Promise((resolve) => {
		let requestObject = {};
		requestObject["token_id"] = tokenId;
		requestObject["asset_contract_address"] = contractAddress;
		requestObject["X-API-KEY"] = OPENSEA_API_KEY;
		if (eventType) {
			requestObject["event_type"] = eventType;
		}
		sdk["retrieving-asset-events"](requestObject)
			.then((res) => resolve({ status: "SUCCESS", data: res }))
			.catch((err) => resolve({ status: "FAILED", error: err.message }));
	});
}

async function getListingsFromOpensea(tokenId, contractAddress) {
	return new Promise((resolve) => {
		const config = {
			method: "get",
			url: `https://api.opensea.io/api/v1/asset/${contractAddress}/${tokenId}/listings?limit=20`,
			headers: {
				"X-API-KEY": OPENSEA_API_KEY,
			},
		};

		axios(config)
			.then(function (response) {
				resolve({ status: "SUCCESS", data: response.data });
			})
			.catch(function (error) {
				resolve({ status: "FAILED", error: error.message });
			});
	});
}

function getDivider(decimal) {
	let divider = "1";
	for (let i = 0; i < decimal; i++) {
		divider += "0";
	}
	divider = Number(divider);
	return divider;
}

async function go() {
	let dataObj = fs.readFileSync("data.json");
	if (!dataObj || dataObj.length === 0) {
		dataObj = { urlArray: [] };
	} else {
		dataObj = JSON.parse(dataObj);
	}

	let urlArray = dataObj.urlArray;
	if (!urlArray) urlArray = [];
	for (let i = 0x000; i <= 0xfff; i++) {
		let urlObject = {};
		const ensAddress = `0x${i.toString(16).padStart(3, "0")}.eth`;
		urlObject["name"] = ensAddress;
		console.log(`processing ${ensAddress}`);
		const name = `0x${i.toString(16).padStart(3, "0")}`;
		const tokenId = getTokenId(name);
		console.log(`tokenId ${tokenId}`);
		try {
			let result = await web3.eth.ens.getOwner(ensAddress);
			if (result.includes("0x0000000000000000000000000000000000000000")) {
				urlObject["unregistered"] = true;
				console.log(`ensName ${ensAddress} is unregistered`);
			} else {
				urlObject["unregistered"] = false;
				let res = await getDataFromOpenSea(tokenId, contractAddress);
				if (res.status === "SUCCESS") {
					let dataObj = res.data;

					await delay(delayAfterEveryAPICall);
					const permalink = dataObj?.permalink;
					urlObject["permalink"] = permalink;
					const owner = dataObj?.owner?.user?.username;
					urlObject["owner"] = owner;
					let address = dataObj?.owner?.address;
					urlObject["address"] = address;
					let numSales = dataObj?.num_sales;

					urlObject["numSales"] = numSales;

					res = await getEventsFromOpenSea(tokenId, contractAddress);
					let events = res.data.asset_events;
					let highestOffer = null;

					let lastSellPrice = null;
					if (events) {
						let offers = events.filter(
							(event) => event.event_type === "offer_entered"
						);

						if (offers.length) {
							highestOffer = offers[0].bid_amount;
							let decimals = offers[0].payment_token.decimals;
							let divider = getDivider(decimals);
							highestOffer = highestOffer / divider;
						}

						let sellPrices = events.filter(
							(event) => event.event_type === "successful"
						);
						if (sellPrices.length) {
							lastSellPrice = sellPrices[0].total_price;
							let decimals = sellPrices[0].payment_token.decimals;
							let divider = getDivider(decimals);
							lastSellPrice = lastSellPrice / divider;
						}
					}
					urlObject["highestOffer"] = highestOffer;

					urlObject["lastSellPrice"] = lastSellPrice;
					urlObject["lastSellPrice"] = lastSellPrice;
					await delay(delayAfterEveryAPICall);
					res = await getListingsFromOpensea(tokenId, contractAddress);
					let listings = res.data.listings;

					let currentPrice = null;
					if (listings.length) {
						currentPrice = listings[0].current_price;
						let decimals = listings[0].payment_token_contract.decimals;
						let divider = getDivider(decimals);
						currentPrice = currentPrice / divider;
					}
					urlObject["currentPrice"] = currentPrice;
					///urlObject["data"] = dataObj;
				} else {
					urlObject["error"] = res.error;
				}
				await delay(delayAfterEveryAPICall);
			}
		} catch (error) {
			urlObject["error"] = error.message;
			console.log(error.message);
		}
		urlArray.push(urlObject);
	}
	dataObj.urlArray = urlArray;

	let updateDate = moment().tz("America/Los_Angeles").format();
	dataObj.updateDate = updateDate;

	fs.writeFileSync(
		"data.json",
		`export const data = ${JSON.stringify(dataObj, null, 2)}`,
		"utf8"
	);
	console.log("The file was saved!");
}

go();

async function getDataFromOpenSea(tokenId, contractAddress) {
	return new Promise((resolve) => {
		sdk["retrieving-a-single-asset"]({
			include_orders: "true",
			asset_contract_address: contractAddress,
			token_id: tokenId,
			"X-API-KEY": OPENSEA_API_KEY,
		})
			.then((res) => resolve({ status: "SUCCESS", data: res }))
			.catch((err) => resolve({ status: "FAILED", error: err.message }));
	});
}

function getTokenId(name) {
	const ethers = require("ethers");
	const BigNumber = ethers.BigNumber;
	const utils = ethers.utils;
	const labelHash = utils.keccak256(utils.toUtf8Bytes(name));
	const tokenId = BigNumber.from(labelHash).toString();
	console.log(tokenId);
	return tokenId;
}
