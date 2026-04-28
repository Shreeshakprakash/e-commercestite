import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
const SUPABASE_URL = 'https://eyicqbqgqjadvlfhyfsf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_kyIL5tPQt2WO5l9dh9s_VQ_d8ORucNG';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('Supabase client initialized:', supabase);


// Temporary mock user
// Replace later with real auth user
const currentUser = {
	id: crypto.randomUUID(),
	name: "You"
};



// ======================
// INIT
// ======================

document.addEventListener("DOMContentLoaded", () => {

	const cards =
		document.querySelectorAll(".card");

	cards.forEach(card => {

		const auctionId =
			Number(card.dataset.auctionId);

		loadAuction(
			auctionId,
			card
		);

		loadBidHistory(
			auctionId,
			card
		);

		setupRealtime(
			auctionId,
			card
		);


		const bidBtn =
			card.querySelector(
				".place-bid-btn"
			);

		bidBtn.addEventListener(
			"click",
			() => placeBid(
				auctionId,
				card
			)
		);

	});

});



// ======================
// LOAD AUCTION
// ======================

async function loadAuction(
	auctionId,
	card
) {

	const {
		data,
		error
	} = await supabase
		.from("auctions")
		.select("*")
		.eq("id", auctionId)
		.single();


	if (error) {
		console.error(error);
		return;
	}


	card.querySelector(
		".product-title"
	).textContent =
		data.product_name;


	card.querySelector(
		".current-bid"
	).textContent =
		`₹${Number(
			data.current_bid
		).toLocaleString()}`;


	updateStatusBadge(
		card,
		data.status
	);


	startTimer(
		data.end_time,
		card,
		auctionId
	);

}




// ======================
// TIMER
// ======================

function startTimer(
	endTime,
	card,
	auctionId
) {

	const timerEl =
		card.querySelector(
			".auction-timer"
		);

	const bidBtn =
		card.querySelector(
			".place-bid-btn"
		);

	const bidInput =
		card.querySelector(
			".bid-input"
		);


	const timer = setInterval(() => {

		const diff =
			new Date(endTime) -
			Date.now();


		if (diff <= 0) {

			clearInterval(timer);

			timerEl.textContent =
				"Auction Ended";

			bidBtn.disabled = true;
			bidInput.disabled = true;

			updateStatusBadge(
				card,
				"ended"
			);

			return;
		}


		const hrs =
			Math.floor(
				diff / 3600000
			);

		const mins =
			Math.floor(
				(diff % 3600000) / 60000
			);

		const secs =
			Math.floor(
				(diff % 60000) / 1000
			);


		timerEl.textContent =
			`Ends in: ${
				String(hrs).padStart(2,"0")
			}:${
				String(mins).padStart(2,"0")
			}:${
				String(secs).padStart(2,"0")
			}`;

	}, 1000);

}




// ======================
// PLACE BID
// ======================

async function placeBid(
	auctionId,
	card
) {

	const input =
		card.querySelector(
			".bid-input"
		);

	const amount =
		Number(input.value);


	if (!amount) {
		alert("Enter bid");
		return;
	}


	const {
		data: auction
	} = await supabase
		.from("auctions")
		.select("*")
		.eq("id", auctionId)
		.single();


	const currentBid =
		Number(
			auction.current_bid
		);


	const minIncrement = 100;


	if (
		amount <
		currentBid + minIncrement
	) {

		alert(
			`Minimum bid ₹${
				currentBid +
				minIncrement
			}`
		);

		return;
	}



	const {
		error: bidError
	} = await supabase
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



	const {
		error:updateError
	} = await supabase
		.from("auctions")
		.update({
			current_bid: amount,
			highest_bidder:
				currentUser.id
		})
		.eq(
			"id",
			auctionId
		);


	if (updateError) {
		console.error(updateError);
		return;
	}



	// Anti-sniping placeholder
	const left =
		new Date(
			auction.end_time
		) - Date.now();


	if (left < 30000) {

		console.log(
			"Extend auction by 30 sec"
		);

	}


	input.value = "";

}




// ======================
// BID HISTORY
// ======================

async function loadBidHistory(
	auctionId,
	card
) {

	const {
		data,
		error
	} = await supabase
		.from("bids")
		.select("*")
		.eq(
			"auction_id",
			auctionId
		)
		.order(
			"created_at",
			{
				ascending:false
			}
		)
		.limit(8);


	if (error) return;


	renderBidHistory(
		data,
		card
	);

}



function renderBidHistory(
	bids,
	card
) {

	const list =
		card.querySelector(
			".bid-list"
		);

	list.innerHTML = "";


	bids.forEach(bid => {

		const li =
			document.createElement("li");

		li.innerHTML = `
			<span class="bid-user">User ${String(bid.user_id).substring(0, 4)}...</span>
			<span class="bid-amount">₹${Number(bid.bid_amount).toLocaleString()}</span>
			<span class="bid-time">${new Date(bid.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
		`;

		list.appendChild(li);

	});

}




// ======================
// REALTIME
// ======================

function setupRealtime(
	auctionId,
	card
) {

	supabase
		.channel(
			`auction-${auctionId}`
		)

		.on(
			"postgres_changes",
			{
				event:"INSERT",
				schema:"public",
				table:"bids",
				filter:
				`auction_id=eq.${auctionId}`
			},

			(payload) => {

				loadBidHistory(
					auctionId,
					card
				);


				card.querySelector(
					".current-bid"
				).textContent =
					`₹${Number(
						payload.new.bid_amount
					).toLocaleString()}`;

			}
		)

		.subscribe();

}




// ======================
// STATUS BADGE
// ======================

function updateStatusBadge(
	card,
	status
) {

	const badge =
		card.querySelector(
			".auction-status"
		);

	badge.classList.remove("status-ended", "status-live", "status-upcoming");

	if (status === "ended") {

		badge.textContent =
			"ENDED";
		badge.classList.add("status-ended");

		return;
	}


	if (status === "active" || status === "live") {

		badge.textContent =
			"LIVE";
		badge.classList.add("status-live");

		return;
	}


	badge.textContent =
		status.toUpperCase();
	badge.classList.add(`status-${status.toLowerCase()}`);

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

document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
});

document.getElementById('backToTop').addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});