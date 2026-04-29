import { supabase } from './auction.js';

const mockProductData = {
    1: {
        image: "../images/headphone.png",
        description: "Experience unparalleled sound quality with the Sony Headphone. These premium noise-canceling headphones are designed to provide the ultimate audio experience, perfect for audiophiles and casual listeners alike.",
        category: "Audio"
    },
    2: {
        image: "../images/headphone2.png",
        description: "The Wireless Sennheiser offers exceptional clarity and a wide soundstage. Built for comfort and long listening sessions, these headphones are an excellent addition to any audio setup.",
        category: "Audio"
    },
    3: {
        image: "../images/laptop2.jpg",
        description: "The Asus Tuf Gaming laptop delivers desktop-like performance in a portable form factor. Engineered with top-tier components, it handles the most demanding games and professional workflows with ease.",
        category: "Laptops"
    }
};

const currentUser = {
	id: crypto.randomUUID(),
	name: "You"
};

const minIncrement = 100;

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const auctionIdParam = urlParams.get('id');
    
    if (!auctionIdParam) {
        window.location.href = "auction_page.html";
        return;
    }

    const auctionId = Number(auctionIdParam);
    const card = document.querySelector(".sticky-data-module");
    card.dataset.auctionId = auctionId;

	const minIncrementEl = card.querySelector("#min-increment");
	if (minIncrementEl) {
		minIncrementEl.textContent = `₹${minIncrement.toLocaleString()}`;
	}

    // Load local mock data for things not in DB
    const localData = mockProductData[auctionId];
    if (localData) {
        document.getElementById('product-image').src = localData.image;
        document.getElementById('product-description').textContent = localData.description;
        document.getElementById('product-category').textContent = localData.category;
    }

    loadAuction(auctionId, card);
    loadBidHistory(auctionId, card);
    setupRealtime(auctionId, card);

    const bidBtn = card.querySelector(".place-bid-btn");
	const bidInput = card.querySelector(".bid-input");
    bidBtn.addEventListener("click", () => placeBid(auctionId, card));
	if (bidInput) {
		bidInput.addEventListener("input", () => toggleBidButtonState(card));
	}
    
    initHeaderScroll();
});

// ======================
// REUSED LOGIC FROM AUCTION.JS
// ======================

async function loadAuction(auctionId, card) {
	const { data, error } = await supabase
		.from("auctions")
		.select("*")
		.eq("id", auctionId)
		.single();

	if (error) {
		console.error(error);
		return;
	}

	card.querySelector(".product-title").textContent = data.product_name;
	card.querySelector(".current-bid").textContent = `₹${Number(data.current_bid).toLocaleString()}`;

	updateNextMinimumBid(card, Number(data.current_bid));
	updateStatusText(data.status);
	
	// Also select the auction status somewhere globally if needed, actually it's in the image frame
	const badge = document.querySelector(".auction-status");
	if (badge) {
	    updateStatusBadgeEl(badge, data.status);
	}

	startTimer(data.end_time, card, auctionId);
}

function startTimer(endTime, card, auctionId) {
	const timerEl = card.querySelector(".auction-timer");
	const bidBtn = card.querySelector(".place-bid-btn");
	const bidInput = card.querySelector(".bid-input");

	const timer = setInterval(() => {
		const diff = new Date(endTime) - Date.now();

		if (diff <= 0) {
			clearInterval(timer);
			timerEl.innerHTML = "<ion-icon name='time-outline'></ion-icon> Auction Ended";
			bidBtn.disabled = true;
			bidInput.disabled = true;
			bidBtn.classList.add("is-disabled");
			updateStatusText("ended");

			const badge = document.querySelector(".auction-status");
			if (badge) updateStatusBadgeEl(badge, "ended");
			return;
		}

		const hrs = Math.floor(diff / 3600000);
		const mins = Math.floor((diff % 3600000) / 60000);
		const secs = Math.floor((diff % 60000) / 1000);

		timerEl.innerHTML = `<ion-icon name='time-outline'></ion-icon> Ends in: ${String(hrs).padStart(2,"0")}:${String(mins).padStart(2,"0")}:${String(secs).padStart(2,"0")}`;
	}, 1000);
}

async function placeBid(auctionId, card) {
	const input = card.querySelector(".bid-input");
	const amount = Number(input.value);

	if (!amount) {
		alert("Enter bid");
		return;
	}

	const { data: auction } = await supabase
		.from("auctions")
		.select("*")
		.eq("id", auctionId)
		.single();

	const currentBid = Number(auction.current_bid);
	const minIncrement = 100;

	if (amount < currentBid + minIncrement) {
		alert(`Minimum bid ₹${currentBid + minIncrement}`);
		return;
	}

	const { error: bidError } = await supabase
		.from("bids")
		.insert({
			auction_id: auctionId,
			user_id: currentUser.id,
			bid_amount: amount
		});

	if (bidError) {
		console.error(bidError);
		return;
	}

	const { error:updateError } = await supabase
		.from("auctions")
		.update({
			current_bid: amount,
			highest_bidder: currentUser.id
		})
		.eq("id", auctionId);

	if (updateError) {
		console.error(updateError);
		return;
	}

	input.value = "";
	toggleBidButtonState(card);
}

async function loadBidHistory(auctionId, card) {
	const { data, error } = await supabase
		.from("bids")
		.select("*")
		.eq("auction_id", auctionId)
		.order("created_at", { ascending:false })
		.limit(10);

	if (error) return;
	renderBidHistory(data, card);
}

function renderBidHistory(bids, card) {
	const list = card.querySelector(".bid-list");
	list.innerHTML = "";

	bids.forEach(bid => {
		const li = document.createElement("li");
		li.classList.add("bid-list-item");
		
		li.innerHTML = `
			<span class="bid-user">User ${String(bid.user_id).substring(0, 4)}</span>
			<span class="bid-amount">₹${Number(bid.bid_amount).toLocaleString()}</span>
			<span class="bid-time">${new Date(bid.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
		`;
		list.appendChild(li);
	});
}

function setupRealtime(auctionId, card) {
	supabase
		.channel(`auction-detail-${auctionId}`)
		.on(
			"postgres_changes",
			{ event:"INSERT", schema:"public", table:"bids", filter: `auction_id=eq.${auctionId}` },
			(payload) => {
				loadBidHistory(auctionId, card);
				card.querySelector(".current-bid").textContent = `₹${Number(payload.new.bid_amount).toLocaleString()}`;
				updateNextMinimumBid(card, Number(payload.new.bid_amount));
			}
		)
		.subscribe();
}

function updateNextMinimumBid(card, currentBid) {
	const nextMin = currentBid + minIncrement;
	const nextMinEl = card.querySelector("#next-min-bid");
	if (nextMinEl) {
		nextMinEl.textContent = `₹${nextMin.toLocaleString()}`;
	}

	const hintEl = card.querySelector("#bid-hint");
	if (hintEl) {
		hintEl.textContent = `Minimum bid: ₹${nextMin.toLocaleString()}`;
	}

	const input = card.querySelector(".bid-input");
	if (input) {
		input.min = String(nextMin);
		input.step = String(minIncrement);
		input.placeholder = `Enter Your Bid (₹${nextMin.toLocaleString()}+)`;
	}

	toggleBidButtonState(card);
}

function toggleBidButtonState(card) {
	const input = card.querySelector(".bid-input");
	const btn = card.querySelector(".place-bid-btn");
	if (!input || !btn || input.disabled) {
		return;
	}

	const value = Number(input.value);
	const min = Number(input.min || 0);
	const isValid = value && value >= min;
	btn.disabled = !isValid;
	btn.classList.toggle("is-disabled", !isValid);
}

function updateStatusBadgeEl(badge, status) {
	badge.classList.remove("status-ended", "status-live", "status-upcoming");
	
	if (status === "ended") {
		badge.textContent = "ENDED";
		badge.classList.add("status-ended");
		return;
	}
	
	if (status === "active" || status === "live") {
		badge.textContent = "LIVE";
		badge.classList.add("status-live");
		return;
	}
	
	badge.textContent = status.toUpperCase();
	badge.classList.add(`status-${status.toLowerCase()}`);
}

function updateStatusText(status) {
	const statusEl = document.getElementById("auction-status-text");
	if (!statusEl) {
		return;
	}

	if (status === "ended") {
		statusEl.textContent = "Ended";
		return;
	}

	if (status === "active" || status === "live") {
		statusEl.textContent = "Live";
		return;
	}

	statusEl.textContent = status ? `${status.charAt(0).toUpperCase()}${status.slice(1)}` : "Unknown";
}

const initHeaderScroll = () => {
    const header = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
};
