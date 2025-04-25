from flask import Flask, request, jsonify
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Service base URLs
SERVICE_URLS = {
    'user': os.getenv('USER_SERVICE_URL', 'http://localhost:3001'),
    'movie': os.getenv('MOVIE_SERVICE_URL', 'http://localhost:3002'),
    'theater': os.getenv('THEATER_SERVICE_URL', 'http://localhost:3003'),
    'booking': os.getenv('BOOKING_SERVICE_URL', 'http://localhost:3004'),
    'payment': os.getenv('PAYMENT_SERVICE_URL', 'http://localhost:3005'),
    'notification': os.getenv('NOTIFICATION_SERVICE_URL', 'http://localhost:3006'),
    'recommendation': os.getenv('RECOMMENDATION_SERVICE_URL', 'http://localhost:3007'),
    'schedule': os.getenv('SCHEDULE_SERVICE_URL', 'http://localhost:3000')
}

# User Service Routes
@app.route('/users/<int:id>', methods=['GET'])
def get_user_by_id(id):
    response = requests.get(f"{SERVICE_URLS['user']}/users/{id}")
    return jsonify(response.json()), response.status_code

# Screen Service Routes
@app.route('/screens/<int:id>', methods=['GET'])
def get_screen_by_id(id):
    response = requests.get(f"{SERVICE_URLS['theater']}/screens/{id}")
    return jsonify(response.json()), response.status_code

@app.route('/screens', methods=['POST'])
def create_screen():
    data = request.json
    response = requests.post(f"{SERVICE_URLS['theater']}/screens", json=data)
    return jsonify(response.json()), response.status_code

@app.route('/screens/<int:id>', methods=['PUT'])
def update_screen(id):
    data = request.json
    response = requests.put(f"{SERVICE_URLS['theater']}/screens/{id}", json=data)
    return jsonify(response.json()), response.status_code

@app.route('/screens/<int:id>', methods=['DELETE'])
def delete_screen(id):
    response = requests.delete(f"{SERVICE_URLS['theater']}/screens/{id}")
    return jsonify(response.json()), response.status_code

# Seat Service Routes
@app.route('/seats/screen/<int:screen_id>', methods=['GET'])
def get_seats_by_screen_id(screen_id):
    response = requests.get(f"{SERVICE_URLS['theater']}/seats/screen/{screen_id}")
    return jsonify(response.json()), response.status_code

@app.route('/seats/<int:id>', methods=['GET'])
def get_seat_by_id(id):
    response = requests.get(f"{SERVICE_URLS['theater']}/seats/{id}")
    return jsonify(response.json()), response.status_code

@app.route('/seats', methods=['POST'])
def create_seat():
    data = request.json
    response = requests.post(f"{SERVICE_URLS['theater']}/seats", json=data)
    return jsonify(response.json()), response.status_code

@app.route('/seats/<int:id>', methods=['PUT'])
def update_seat(id):
    data = request.json
    response = requests.put(f"{SERVICE_URLS['theater']}/seats/{id}", json=data)
    return jsonify(response.json()), response.status_code

@app.route('/seats/<int:id>', methods=['DELETE'])
def delete_seat(id):
    response = requests.delete(f"{SERVICE_URLS['theater']}/seats/{id}")
    return jsonify(response.json()), response.status_code

@app.route('/seats/batch', methods=['POST'])
def create_multiple_seats():
    data = request.json
    response = requests.post(f"{SERVICE_URLS['theater']}/seats/batch", json=data)
    return jsonify(response.json()), response.status_code

# Theater Service Routes
@app.route('/theaters', methods=['GET'])
def get_all_theaters():
    response = requests.get(f"{SERVICE_URLS['theater']}/theaters")
    return jsonify(response.json()), response.status_code

@app.route('/theaters/<int:id>', methods=['GET'])
def get_theater_by_id(id):
    response = requests.get(f"{SERVICE_URLS['theater']}/theaters/{id}")
    return jsonify(response.json()), response.status_code

@app.route('/theaters', methods=['POST'])
def create_theater():
    data = request.json
    response = requests.post(f"{SERVICE_URLS['theater']}/theaters", json=data)
    return jsonify(response.json()), response.status_code

@app.route('/theaters/<int:id>', methods=['PUT'])
def update_theater(id):
    data = request.json
    response = requests.put(f"{SERVICE_URLS['theater']}/theaters/{id}", json=data)
    return jsonify(response.json()), response.status_code

@app.route('/theaters/<int:id>', methods=['DELETE'])
def delete_theater(id):
    response = requests.delete(f"{SERVICE_URLS['theater']}/theaters/{id}")
    return jsonify(response.json()), response.status_code

# Schedule Service Routes
@app.route('/schedules', methods=['GET'])
def get_all_schedules():
    response = requests.get(f"{SERVICE_URLS['schedule']}/schedules")
    return jsonify(response.json()), response.status_code

@app.route('/schedules/<int:id>', methods=['GET'])
def get_schedule_by_id(id):
    response = requests.get(f"{SERVICE_URLS['schedule']}/schedules/{id}")
    return jsonify(response.json()), response.status_code

@app.route('/schedules', methods=['POST'])
def create_schedule():
    data = request.json
    response = requests.post(f"{SERVICE_URLS['schedule']}/schedules", json=data)
    return jsonify(response.json()), response.status_code

@app.route('/schedules/<int:id>', methods=['PUT'])
def update_schedule(id):
    data = request.json
    response = requests.put(f"{SERVICE_URLS['schedule']}/schedules/{id}", json=data)
    return jsonify(response.json()), response.status_code

@app.route('/schedules/<int:id>', methods=['DELETE'])
def delete_schedule(id):
    response = requests.delete(f"{SERVICE_URLS['schedule']}/schedules/{id}")
    return jsonify(response.json()), response.status_code

@app.route('/schedules/<int:id>/seats', methods=['PATCH'])
def update_available_seats(id):
    data = request.json
    response = requests.patch(f"{SERVICE_URLS['schedule']}/schedules/{id}/seats", json=data)
    return jsonify(response.json()), response.status_code

# Recommendation Service Routes
@app.route('/recommendations/analysis/report', methods=['GET'])
def get_analysis_report():
    response = requests.get(f"{SERVICE_URLS['recommendation']}/recommendations/analysis/report")
    return jsonify(response.json()), response.status_code

@app.route('/recommendations/interaction', methods=['POST'])
def track_user_interaction():
    data = request.json
    response = requests.post(f"{SERVICE_URLS['recommendation']}/recommendations/interaction", json=data)
    return jsonify(response.json()), response.status_code

@app.route('/recommendations/model/performance', methods=['GET'])
def get_model_performance():
    response = requests.get(f"{SERVICE_URLS['recommendation']}/recommendations/model/performance")
    return jsonify(response.json()), response.status_code

@app.route('/recommendations/training/history', methods=['GET'])
def get_training_history():
    response = requests.get(f"{SERVICE_URLS['recommendation']}/recommendations/training/history")
    return jsonify(response.json()), response.status_code

@app.route('/recommendations/training/<int:training_id>/recommendations', methods=['GET'])
def get_recommendations_from_training(training_id):
    response = requests.get(f"{SERVICE_URLS['recommendation']}/recommendations/training/{training_id}/recommendations")
    return jsonify(response.json()), response.status_code

# Payment Service Routes
@app.route('/payments', methods=['GET'])
def get_all_payments():
    response = requests.get(f"{SERVICE_URLS['payment']}/payments")
    return jsonify(response.json()), response.status_code

@app.route('/payments/statistics/summary', methods=['GET'])
def get_payment_statistics():
    response = requests.get(f"{SERVICE_URLS['payment']}/payments/statistics/summary")
    return jsonify(response.json()), response.status_code

# Genre Service Routes
@app.route('/genres', methods=['GET'])
def get_all_genres():
    response = requests.get(f"{SERVICE_URLS['movie']}/genres")
    return jsonify(response.json()), response.status_code

@app.route('/genres', methods=['POST'])
def create_genre():
    data = request.json
    response = requests.post(f"{SERVICE_URLS['movie']}/genres", json=data)
    return jsonify(response.json()), response.status_code

@app.route('/genres/<int:id>', methods=['GET'])
def get_genre_by_id(id):
    response = requests.get(f"{SERVICE_URLS['movie']}/genres/{id}")
    return jsonify(response.json()), response.status_code

@app.route('/genres/<int:id>', methods=['PUT'])
def update_genre(id):
    data = request.json
    response = requests.put(f"{SERVICE_URLS['movie']}/genres/{id}", json=data)
    return jsonify(response.json()), response.status_code

@app.route('/genres/<int:id>', methods=['DELETE'])
def delete_genre(id):
    response = requests.delete(f"{SERVICE_URLS['movie']}/genres/{id}")
    return jsonify(response.json()), response.status_code

# Movie Service Routes
@app.route('/movies/<int:id>', methods=['GET'])
def get_movie_by_id(id):
    response = requests.get(f"{SERVICE_URLS['movie']}/movies/{id}")
    return jsonify(response.json()), response.status_code

@app.route('/movies/<int:id>', methods=['PUT'])
def update_movie(id):
    data = request.json
    response = requests.put(f"{SERVICE_URLS['movie']}/movies/{id}", json=data)
    return jsonify(response.json()), response.status_code

@app.route('/movies/<int:id>', methods=['DELETE'])
def delete_movie(id):
    response = requests.delete(f"{SERVICE_URLS['movie']}/movies/{id}")
    return jsonify(response.json()), response.status_code

@app.route('/movies', methods=['GET'])
def get_all_movies():
    response = requests.get(f"{SERVICE_URLS['movie']}/movies")
    return jsonify(response.json()), response.status_code

@app.route('/movies', methods=['POST'])
def create_movie():
    data = request.json
    response = requests.post(f"{SERVICE_URLS['movie']}/movies", json=data)
    return jsonify(response.json()), response.status_code

# Booking Service Routes
@app.route('/booking', methods=['GET'])
def get_all_bookings():
    response = requests.get(f"{SERVICE_URLS['booking']}/bookings")
    return jsonify(response.json()), response.status_code

@app.route('/booking/statistics/summary', methods=['GET'])
def get_booking_statistics():
    response = requests.get(f"{SERVICE_URLS['booking']}/bookings/statistics/summary")
    return jsonify(response.json()), response.status_code

# Health check for all services
@app.route('/health', methods=['GET'])
def health_check():
    health_results = {}
    for service_name, url in SERVICE_URLS.items():
        try:
            response = requests.get(f"{url}/health", timeout=2)
            if response.status_code == 200:
                health_results[service_name] = {
                    "status": "UP",
                    "details": response.json()
                }
            else:
                health_results[service_name] = {"status": "DOWN", "reason": "Non-200 response"}
        except requests.exceptions.RequestException:
            health_results[service_name] = {"status": "DOWN", "reason": "Connection error"}
    
    overall_status = "UP" if all(service["status"] == "UP" for service in health_results.values()) else "DOWN"
    return jsonify({
        "status": overall_status,
        "services": health_results
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)