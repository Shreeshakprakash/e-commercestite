import { supabase } from "./supabase.js";

const fields = {
    name: document.getElementById("name"),
    phone: document.getElementById("phone"),
    address: document.getElementById("address"),
    city: document.getElementById("city"),
    pincode: document.getElementById("pincode")
};

const saveBtn = document.getElementById("profile-save-btn");
const form = document.getElementById("profileForm");
const profileName = document.getElementById("profile-name");
const profileEmail = document.getElementById("profile-email");
const profileAvatarText = document.getElementById("profile-avatar-text");
const profileAvatarImg = document.getElementById("profile-avatar-img");
const avatarInput = document.getElementById("profile-avatar-input");
const logoutBtn = document.getElementById("profile-logout-btn");
const passwordForm = document.getElementById("passwordForm");
const newPasswordInput = document.getElementById("new-password");
const confirmPasswordInput = document.getElementById("confirm-password");
const passwordSaveBtn = document.getElementById("password-save-btn");
const ordersList = document.getElementById("orders-list");
let profileExists = false;

const AVATAR_BUCKET = "profile-images";
const AVATAR_COLUMN = "avatar_url";

const getInitials = (name, email) => {
    if (name && name.trim()) {
        return name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0].toUpperCase())
            .join("");
    }

    if (email && email.trim()) {
        return email.trim().slice(0, 2).toUpperCase();
    }

    return "PP";
};

const getUserOrRedirect = async () => {
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (!user) {
        alert("Please sign in to continue.");
        window.location.href = "login.html";
        return null;
    }

    return user;
};

const loadProfile = async (user) => {
    const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone, address, city, pincode, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

    if (profile) {
        if (fields.name) fields.name.value = profile.full_name || "";
        if (fields.phone) fields.phone.value = profile.phone || "";
        if (fields.address) fields.address.value = profile.address || "";
        if (fields.city) fields.city.value = profile.city || "";
        if (fields.pincode) fields.pincode.value = profile.pincode || "";

        if (profile.avatar_url && profileAvatarImg) {
            profileAvatarImg.src = profile.avatar_url;
            const wrapper = profileAvatarImg.closest(".profile-avatar");
            if (wrapper) wrapper.classList.add("has-image");
        }

        if (saveBtn) {
            const text = saveBtn.querySelector(".btn-text");
            if (text) text.textContent = "Update";
        }
    }

    return profile;
};

const renderOrders = (orders, itemsMap) => {
    if (!ordersList) return;

    if (!orders || orders.length === 0) {
        ordersList.innerHTML = '<div class="orders-empty">No orders yet.</div>';
        return;
    }

    ordersList.innerHTML = '';

    orders.forEach((order) => {
        const items = itemsMap[order.id] || [];
        const orderDate = order.created_at
            ? new Date(order.created_at).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })
            : 'Date unavailable';
        const status = order.status || 'processing';

        const itemsMarkup = items.length
            ? items.map((item) => `
                <div class="order-item-row">
                    <span>${item.product_name} x${item.quantity}</span>
                    <span>₹${Number(item.price * item.quantity).toFixed(2)}</span>
                </div>
            `).join('')
            : '<div class="order-item-row"><span>No items found</span><span></span></div>';

        const card = document.createElement('div');
        card.className = 'order-card';
        card.innerHTML = `
            <div class="order-header">
                <div>
                    <div class="order-id">Order #${order.order_ref || order.id}</div>
                    <div class="order-date">${orderDate}</div>
                </div>
                <span class="order-status">${status}</span>
            </div>
            <div class="order-items">
                ${itemsMarkup}
            </div>
            <div class="order-footer">
                <span>Payment: ${order.payment_method || 'N/A'}</span>
                <span>Total: ₹${Number(order.total).toFixed(2)}</span>
            </div>
        `;

        ordersList.appendChild(card);
    });
};

const loadOrders = async (user) => {
    if (!ordersList) return;

    ordersList.innerHTML = '<div class="orders-loading">Loading orders...</div>';

    const { data: orders, error } = await supabase
        .from('orders')
        .select('id, order_ref, subtotal, shipping, total, payment_method, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        ordersList.innerHTML = '<div class="orders-empty">Unable to load orders.</div>';
        return;
    }

    if (!orders || orders.length === 0) {
        ordersList.innerHTML = '<div class="orders-empty">No orders yet.</div>';
        return;
    }

    const orderIds = orders.map((order) => order.id);
    const { data: items } = await supabase
        .from('order_items')
        .select('order_id, product_name, quantity, price')
        .in('order_id', orderIds);

    const itemsMap = {};
    if (items) {
        items.forEach((item) => {
            if (!itemsMap[item.order_id]) {
                itemsMap[item.order_id] = [];
            }
            itemsMap[item.order_id].push(item);
        });
    }

    renderOrders(orders, itemsMap);
};

document.addEventListener("DOMContentLoaded", async () => {
    const user = await getUserOrRedirect();
    if (!user) return;

    const profile = await loadProfile(user);
    profileExists = Boolean(profile);

    const displayName =
        (profile && profile.full_name) || user.user_metadata?.full_name || "Your Profile";

    if (profileName) profileName.textContent = displayName;
    if (profileEmail) profileEmail.textContent = user.email || "";
    if (profileAvatarText) {
        profileAvatarText.textContent = getInitials(displayName, user.email);
    }

    if (fields.name && !fields.name.value && user.user_metadata?.full_name) {
        fields.name.value = user.user_metadata.full_name;
    }

    await loadOrders(user);
});

if (avatarInput) {
    avatarInput.addEventListener("change", () => {
        const file = avatarInput.files && avatarInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            if (!profileAvatarImg || typeof reader.result !== "string") return;
            profileAvatarImg.src = reader.result;
            const wrapper = profileAvatarImg.closest(".profile-avatar");
            if (wrapper) wrapper.classList.add("has-image");
        };
        reader.readAsDataURL(file);
    });
}

const uploadAvatar = async (user) => {
    const file = avatarInput && avatarInput.files && avatarInput.files[0];
    if (!file) return "";

    const fileExt = file.name.split(".").pop();
    const fileName = `avatar-${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error } = await supabase
        .storage
        .from(AVATAR_BUCKET)
        .upload(filePath, file, { upsert: true, cacheControl: "3600" });

    if (error) {
        throw error;
    }

    const { data } = supabase
        .storage
        .from(AVATAR_BUCKET)
        .getPublicUrl(filePath);

    return data ? data.publicUrl : "";
};

if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        await supabase.auth.signOut();
        window.location.href = "login.html";
    });
}

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const user = await getUserOrRedirect();
        if (!user) return;

        if (saveBtn) {
            saveBtn.classList.add("loading");
            saveBtn.disabled = true;
        }

        const metadataName = user.user_metadata?.full_name || "";
        const inputName = fields.name ? fields.name.value : "";
        const resolvedName = inputName.trim() || metadataName.trim();

        const profileData = {
            id: user.id,
            full_name: resolvedName,
            phone: fields.phone ? fields.phone.value : "",
            address: fields.address ? fields.address.value : "",
            city: fields.city ? fields.city.value : "",
            pincode: fields.pincode ? fields.pincode.value : ""
        };

        try {
            const avatarUrl = await uploadAvatar(user);
            if (avatarUrl) profileData[AVATAR_COLUMN] = avatarUrl;
        } catch (error) {
            alert(error.message);
            if (saveBtn) {
                saveBtn.classList.remove("loading");
                saveBtn.disabled = false;
            }
            return;
        }

        const { error } = profileExists
            ? await supabase
                .from("profiles")
                .update(profileData)
                .eq("id", user.id)
            : await supabase
                .from("profiles")
                .insert(profileData);

        if (error) {
            alert(error.message);
            if (saveBtn) {
                saveBtn.classList.remove("loading");
                saveBtn.disabled = false;
            }
            return;
        }

        profileExists = true;
        alert("Profile saved!");
        if (saveBtn) {
            saveBtn.classList.remove("loading");
            saveBtn.disabled = false;
            const text = saveBtn.querySelector(".btn-text");
            if (text) text.textContent = "Update";
        }
    });
}

if (passwordForm) {
    passwordForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const newPassword = newPasswordInput ? newPasswordInput.value.trim() : "";
        const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value.trim() : "";

        if (!newPassword || newPassword.length < 6) {
            alert("Password must be at least 6 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        if (passwordSaveBtn) {
            passwordSaveBtn.disabled = true;
            passwordSaveBtn.textContent = "Updating...";
        }

        const { error } = await supabase.auth.updateUser({ password: newPassword });

        if (passwordSaveBtn) {
            passwordSaveBtn.disabled = false;
            passwordSaveBtn.textContent = "Update password";
        }

        if (error) {
            alert(error.message);
            return;
        }

        if (newPasswordInput) newPasswordInput.value = "";
        if (confirmPasswordInput) confirmPasswordInput.value = "";
        alert("Password updated.");
    });
}
