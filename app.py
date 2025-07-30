from flask import Flask, render_template, request, jsonify, send_file
import io
import csv

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

# ---------------- 1️⃣ Valuation Engine ----------------
@app.route('/calculate_valuation', methods=['POST'])
def calculate_valuation():
    try:
        revenue = float(request.form.get('revenue', 0))
        growth = float(request.form.get('growth', 0)) / 100
        discount = float(request.form.get('discount', 0)) / 100
        method = request.form.get('method', 'DCF')

        # Example logic for each method
        if method == 'DCF':
            valuation = revenue * (1 + growth) / (discount if discount else 0.1)
        elif method == 'VC':
            valuation = revenue * 5  # simple multiplier
        else:  # Market Multiples
            valuation = revenue * 3

        return jsonify({'valuation': round(valuation, 2)})

    except Exception as e:
        return jsonify({'error': str(e)})


# ---------------- 2️⃣ Financial Metrics ----------------
@app.route('/calculate_metrics', methods=['POST'])
def calculate_metrics():
    try:
        revenue = float(request.form.get('revenue', 0))
        cogs = float(request.form.get('cogs', 0))
        opex = float(request.form.get('opex', 0))
        cash = float(request.form.get('cash', 0))
        burn = float(request.form.get('burn', 0))
        ltv = float(request.form.get('ltv', 0))
        cac = float(request.form.get('cac', 0))

        profit = revenue - (cogs + opex)
        margin = round((profit / revenue) * 100, 2) if revenue else 0
        runway = int(cash / burn) if burn else 0
        ltv_cac = round(ltv / cac, 2) if cac else 0

        return jsonify({
            'revenue': revenue,
            'profit': profit,
            'margin': margin,
            'runway': runway,
            'ltv_cac': ltv_cac
        })

    except Exception as e:
        return jsonify({'error': str(e)})


# ---------------- 3️⃣ Fundraising Planner ----------------
@app.route('/plan_funding', methods=['POST'])
def plan_funding():
    try:
        current_cash = float(request.form.get('current_cash', 0))
        burn_rate = float(request.form.get('burn_rate', 0))
        months = int(request.form.get('months', 0))
        equity = float(request.form.get('equity', 0))

        required_funding = max(burn_rate * months - current_cash, 0)
        dilution = equity

        return jsonify({
            'funding': required_funding,
            'dilution': dilution,
            'current_cash': current_cash
        })

    except Exception as e:
        return jsonify({'error': str(e)})


# ---------------- 4️⃣ Scenario Simulator ----------------
@app.route('/simulate_scenario', methods=['POST'])
def simulate_scenario():
    try:
        base_revenue = float(request.form.get('base_revenue', 0))
        growth_rate = float(request.form.get('growth_rate', 0)) / 100
        years = int(request.form.get('years', 1))

        revenue_list = [round(base_revenue * ((1 + growth_rate) ** i), 2) for i in range(1, years + 1)]
        years_list = [f"Year {i}" for i in range(1, years + 1)]

        return jsonify({
            'future_revenue': revenue_list[-1],
            'revenue_list': revenue_list,
            'years_list': years_list,
            'years': years
        })

    except Exception as e:
        return jsonify({'error': str(e)})


# ---------------- 5️⃣ Admin Settings ----------------
@app.route('/update_settings', methods=['POST'])
def update_settings():
    branding = request.form.get('branding', 'Finavue')
    discount = request.form.get('discount', 'N/A')
    return jsonify({'message': f'Settings updated: Branding = {branding}, Discount Rate = {discount}%'})

# ---------------- 6️⃣ Download Report ----------------
@app.route('/download_report')
def download_report():
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Metric', 'Value'])
    writer.writerow(['Revenue', '1000000'])
    writer.writerow(['Valuation', '5000000'])
    writer.writerow(['Profit Margin', '20%'])
    output.seek(0)

    return send_file(
        io.BytesIO(output.getvalue().encode()),
        mimetype='text/csv',
        as_attachment=True,
        download_name='finavue_report.csv'
    )


if __name__ == '__main__':
    app.run(debug=True)
