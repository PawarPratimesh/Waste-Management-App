const rewards = [
    {
        id: '1',
        name: 'Eco-Friendly Water Bottle',
        description: 'Stainless steel water bottle with temperature control. Perfect for reducing plastic waste.',
        points: 500,
        category: 'Eco Products',
        image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=300&fit=crop',
        stock: 25,
        featured: true
    },
    {
        id: '2',
        name: 'Bamboo Cutlery Set',
        description: 'Complete bamboo cutlery set with carrying case. Sustainable dining solution.',
        points: 300,
        category: 'Eco Products',
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
        stock: 50
    },
    {
        id: '3',
        name: 'Plant-a-Tree Certificate',
        description: 'We will plant a tree in your name in our reforestation project.',
        points: 200,
        category: 'Environmental',
        image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
        stock: 100,
        featured: true
    },
    {
        id: '4',
        name: 'Organic Cotton Tote Bag',
        description: 'Durable organic cotton bag for all your shopping needs. Say no to plastic bags.',
        points: 250,
        category: 'Eco Products',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
        stock: 75
    },
    {
        id: '5',
        name: '$25 Amazon Gift Card',
        description: 'Digital gift card delivered to your email. Perfect for online shopping.',
        points: 1000,
        category: 'Gift Cards',
        image: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=400&h=300&fit=crop',
        stock: 20
    },
    {
        id: '6',
        name: 'Solar Power Bank',
        description: 'Portable solar charger for your devices. Harness the power of the sun.',
        points: 800,
        category: 'Tech',
        image: 'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=400&h=300&fit=crop',
        stock: 15
    },
    {
        id: '7',
        name: 'Composting Starter Kit',
        description: 'Everything you need to start composting at home. Includes guide and tools.',
        points: 400,
        category: 'Gardening',
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
        stock: 30
    },
    {
        id: '8',
        name: 'LED Smart Bulb',
        description: 'Energy-efficient smart LED bulb with app control. Save energy and money.',
        points: 350,
        category: 'Tech',
        image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
        stock: 40
    }
];

let userPoints = parseInt(localStorage.getItem("userPoints") || "0", 10);
let selectedReward = null;
let filteredRewards = [...rewards];

const userPointsElement = document.getElementById('userPoints');
const rewardsGrid = document.getElementById('rewardsGrid');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const noResults = document.getElementById('noResults');
const redeemModal = document.getElementById('redeemModal');
const successModal = document.getElementById('successModal');
const rewardPreview = document.getElementById('rewardPreview');
const deliveryItemName = document.getElementById('deliveryItemName');

const levelValue = document.querySelector('.level-value');
const levelSubtitle = document.querySelector('.level-subtitle');
const progressFill = document.querySelector('.progress-fill');
const itemsRedeemedElement = document.getElementById("itemsRedeemed");
const itemsRedeemedTodayElement = document.getElementById("itemsRedeemedToday");

function init() {
    updateUserPoints();
    updateItemsRedeemed();
    updateDailyRedeemedCount();
    renderRewards();
    setupEventListeners();
    checkWasteUploadPoints();
}

function updateUserPoints() {
    userPointsElement.textContent = userPoints.toLocaleString();
    localStorage.setItem("userPoints", userPoints);
    updateUserLevel();
}

function updateUserLevel() {
    let level = 1, basePoints = 0, nextLevelPoints = 500;

    if (userPoints >= 2000) {
        level = 5; basePoints = 2000;
    } else if (userPoints >= 1500) {
        level = 4; basePoints = 1500; nextLevelPoints = 2000;
    } else if (userPoints >= 1000) {
        level = 3; basePoints = 1000; nextLevelPoints = 1500;
    } else if (userPoints >= 500) {
        level = 2; basePoints = 500; nextLevelPoints = 1000;
    }

    levelValue.textContent = `Level ${level}`;
    if (nextLevelPoints) {
        const progress = ((userPoints - basePoints) / (nextLevelPoints - basePoints)) * 100;
        levelSubtitle.textContent = `${nextLevelPoints - userPoints} points to Level ${level + 1}`;
        progressFill.style.width = `${progress}%`;
    } else {
        levelSubtitle.textContent = "Max level reached";
        progressFill.style.width = "100%";
    }
}

function updateItemsRedeemed() {
    const count = parseInt(localStorage.getItem("itemsRedeemed") || "0", 10);
    if (itemsRedeemedElement) itemsRedeemedElement.textContent = count;
}

function updateDailyRedeemedCount() {
    const today = new Date().toISOString().split('T')[0];
    const redeemedPerDay = JSON.parse(localStorage.getItem("itemsRedeemedPerDay") || "{}");
    const todayCount = redeemedPerDay[today] || 0;
    if (itemsRedeemedTodayElement) itemsRedeemedTodayElement.textContent = todayCount;
}

function setupEventListeners() {
    searchInput.addEventListener('input', filterRewards);
    categoryFilter.addEventListener('change', filterRewards);

    redeemModal.addEventListener('click', (e) => {
        if (e.target === redeemModal) closeRedeemModal();
    });

    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) closeSuccessModal();
    });
}

function filterRewards() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    filteredRewards = rewards.filter(reward => {
        const matchesSearch = reward.name.toLowerCase().includes(searchTerm) || reward.description.toLowerCase().includes(searchTerm);
        const matchesCategory = selectedCategory === 'All' || reward.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });
    renderRewards();
}

function renderRewards() {
    if (filteredRewards.length === 0) {
        rewardsGrid.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }

    rewardsGrid.style.display = 'grid';
    noResults.style.display = 'none';
    rewardsGrid.innerHTML = filteredRewards.map(reward => createRewardCard(reward)).join('');
}

function createRewardCard(reward) {
    const canAfford = userPoints >= reward.points;
    const isOutOfStock = reward.stock === 0;

    return `
        <div class="reward-card ${reward.featured ? 'featured' : ''}">
            ${reward.featured ? `<div class="featured-badge">🌟 Featured Reward</div>` : ''}
            <div class="reward-image-container">
                <img src="${reward.image}" alt="${reward.name}" class="reward-image" />
                ${isOutOfStock ? `<div class="out-of-stock-overlay"><span class="out-of-stock-badge">Out of Stock</span></div>` : ''}
                <div class="points-badge">${reward.points} pts</div>
            </div>
            <div class="reward-content">
                <div class="reward-meta">
                    <span class="category-badge">${reward.category}</span>
                    <span class="stock-info">${reward.stock} left</span>
                </div>
                <h3 class="reward-title">${reward.name}</h3>
                <p class="reward-description">${reward.description}</p>
                <button 
                    class="redeem-btn ${canAfford && !isOutOfStock ? 'available' : 'disabled'}"
                    onclick="openRedeemModal('${reward.id}')"
                    ${!canAfford || isOutOfStock ? 'disabled' : ''}
                >
                    ${isOutOfStock ? 'Out of Stock' : canAfford ? 'Redeem Now' : `Need ${reward.points - userPoints} more pts`}
                </button>
            </div>
        </div>
    `;
}

function openRedeemModal(rewardId) {
    selectedReward = rewards.find(r => r.id === rewardId);
    if (!selectedReward || userPoints < selectedReward.points || selectedReward.stock === 0) return;

    rewardPreview.innerHTML = `
        <h3 class="preview-title">${selectedReward.name}</h3>
        <p class="preview-description">${selectedReward.description}</p>
        <div class="preview-details">
            <span class="preview-points">${selectedReward.points} Points</span>
            <span class="preview-stock">${selectedReward.stock} remaining</span>
        </div>
    `;
    redeemModal.style.display = 'flex';
}

function closeRedeemModal() {
    redeemModal.style.display = 'none';
    selectedReward = null;
}

function confirmRedeem() {
    if (!selectedReward) return;

    userPoints -= selectedReward.points;
    selectedReward.stock -= 1;

    let totalRedeemed = parseInt(localStorage.getItem("itemsRedeemed") || "0", 10);
    localStorage.setItem("itemsRedeemed", totalRedeemed + 1);

    const today = new Date().toISOString().split('T')[0];
    const redeemedPerDay = JSON.parse(localStorage.getItem("itemsRedeemedPerDay") || "{}");
    redeemedPerDay[today] = (redeemedPerDay[today] || 0) + 1;
    localStorage.setItem("itemsRedeemedPerDay", JSON.stringify(redeemedPerDay));

    updateUserPoints();
    updateItemsRedeemed();
    updateDailyRedeemedCount();

    deliveryItemName.textContent = selectedReward.name;
    closeRedeemModal();
    successModal.style.display = 'flex';
    renderRewards();
}

function closeSuccessModal() {
    successModal.style.display = 'none';
    selectedReward = null;
}

function checkWasteUploadPoints() {
    const wasteType = localStorage.getItem("lastWasteType");

    if (wasteType) {
        const pointsByCategory = {
            "Plastic": 100,
            "Organic": 150,
            "E-Waste": 200,
            "Metal": 180,
            "Glass": 120,
            "Other": 80
        };

        const earnedPoints = pointsByCategory[wasteType] || 50;
        userPoints += earnedPoints;

        localStorage.setItem("userPoints", userPoints);
        alert(`🎉 You uploaded ${wasteType} waste and earned ${earnedPoints} points!`);

        localStorage.removeItem("lastWasteType");

        updateUserPoints();
        renderRewards();
    }
}

document.addEventListener('DOMContentLoaded', init);
