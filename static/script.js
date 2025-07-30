document.addEventListener("DOMContentLoaded", function () {

    let currentChart = null;

    function formatINR(value) {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
    }

    // 1️⃣ Valuation Engine
    document.getElementById("valuationForm").addEventListener("submit", function (e) {
        e.preventDefault();

        const revenue = parseFloat(this.revenue.value);
        const growth = parseFloat(this.growth.value) / 100;
        const discount = parseFloat(this.discount.value) / 100;
        const method = this.method.value;

        let valuation = 0;
        let yearlyRevenue = [];
        let years = [1, 2, 3, 4, 5];

        // Compute 5-year revenue projections
        for (let t = 1; t <= 5; t++) {
            let rev = revenue * Math.pow(1 + growth, t);
            yearlyRevenue.push(rev);
        }

        if (method === "DCF") {
            // Discounted Cash Flow
            for (let t = 1; t <= 5; t++) {
                valuation += yearlyRevenue[t-1] / Math.pow(1 + discount, t);
            }

        } else if (method === "VC") {
            // VC: sum discounted revenues + discounted exit
            const exitMultiple = 5;
            let discountedSum = 0;
            for (let t = 1; t <= 5; t++) {
                discountedSum += yearlyRevenue[t-1] / Math.pow(1 + discount, t);
            }
            const exitVal = (yearlyRevenue[4] * exitMultiple) / Math.pow(1 + discount, 5);
            valuation = discountedSum + exitVal;

        } else if (method === "Market Multiples") {
            // Market Multiple: 5th-year revenue × 3
            const multiple = 3;
            valuation = yearlyRevenue[4] * multiple;
        }

        // Display Result
        document.getElementById("valuationResult").innerText =
            "Estimated Valuation: " + formatINR(valuation);

        // Create Chart
        const ctx = document.getElementById("valuationChart").getContext("2d");
        if (currentChart) currentChart.destroy();
        currentChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: years.map(y => "Year " + y),
                datasets: [{
                    label: "Revenue Projection (₹)",
                    data: yearlyRevenue,
                    backgroundColor: "rgba(0, 128, 0, 0.6)"
                }]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });
    });

    // 2️⃣ Financial Metrics
    document.getElementById("metricsForm").addEventListener("submit", function (e) {
        e.preventDefault();

        const revenue = parseFloat(this.revenue.value);
        const cogs = parseFloat(this.cogs.value);
        const opex = parseFloat(this.opex.value);
        const cash = parseFloat(this.cash.value);
        const burn = parseFloat(this.burn.value);
        const ltv = parseFloat(this.ltv.value);
        const cac = parseFloat(this.cac.value);

        const profit = revenue - (cogs + opex);
        const profitMargin = ((profit / revenue) * 100).toFixed(2);
        const runway = (cash / burn).toFixed(1);
        const ltvcac = (ltv / cac).toFixed(2);

        document.getElementById("metricsResult").innerText =
            `Profit Margin: ${profitMargin}% | Runway: ${runway} months | LTV/CAC: ${ltvcac}`;
    });

    // 3️⃣ Fundraising Planner
    document.getElementById("fundingForm").addEventListener("submit", function (e) {
        e.preventDefault();

        const currentCash = parseFloat(this.current_cash.value);
        const burnRate = parseFloat(this.burn_rate.value);
        const months = parseFloat(this.months.value);
        const equity = parseFloat(this.equity.value);

        const fundingNeeded = burnRate * months - currentCash;
        const postMoneyValuation = fundingNeeded / (equity / 100);
        const preMoneyValuation = postMoneyValuation - fundingNeeded;

        document.getElementById("fundingResult").innerText =
            `Funding Needed: ${formatINR(fundingNeeded)} | Pre-Money: ${formatINR(preMoneyValuation)} | Post-Money: ${formatINR(postMoneyValuation)}`;
    });

    // 4️⃣ Scenario Simulator
    document.getElementById("scenarioForm").addEventListener("submit", function (e) {
        e.preventDefault();

        const baseRevenue = parseFloat(this.base_revenue.value);
        const growthRate = parseFloat(this.growth_rate.value) / 100;
        const years = parseInt(this.years.value);

        let scenarioRevenue = [];
        for (let t = 1; t <= years; t++) {
            scenarioRevenue.push(baseRevenue * Math.pow(1 + growthRate, t));
        }

        document.getElementById("scenarioResult").innerText =
            `Projected Revenue after ${years} years: ${formatINR(scenarioRevenue[scenarioRevenue.length-1])}`;

        const ctx = document.getElementById("scenarioChart").getContext("2d");
        if (currentChart) currentChart.destroy();
        currentChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: Array.from({ length: years }, (_, i) => "Year " + (i + 1)),
                datasets: [{
                    label: "Scenario Revenue (₹)",
                    data: scenarioRevenue,
                    backgroundColor: "rgba(0, 0, 255, 0.6)"
                }]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });
    });

});
