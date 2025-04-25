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

# Health check for all services
@app.route('/health', methods=['GET'])
def health_check():
    health_status = {}
    for service_name, base_url in SERVICE_URLS.items():
        try:
            response = requests.get(f"{base_url}/health", timeout=3)
            if response.status_code == 200:
                health_status[service_name] = "UP"
            else:
                health_status[service_name] = f"DOWN (Status: {response.status_code})"
        except requests.RequestException as e:
            health_status[service_name] = f"DOWN (Error: {str(e)})"
    
    return jsonify({
        "status": "Operational" if all(status == "UP" for status in health_status.values()) else "Degraded",
        "services": health_status
    })

# User Service Endpoints
@app.route('/users/register', methods=['POST'])
def register_user():
    data = request.json
    response = requests.post(f"{SERVICE_URLS['user']}/users/register", json=data)
    return jsonify(response.json()), response.status_code

@app.route('/users/login', methods=['POST'])
def login_user():
    data = request.json
    response = requests.post(f"{SERVICE_URLS['user']}/users/login", json=data)
    return jsonify(response.json()), response.status_code

@app.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    response = requests.get(f"{SERVICE_URLS['user']}/users/{user_id}")
    return jsonify(response.json()), response.status_code

# Movie Service Endpoints
@app.route('/movies', methods=['GET'])
def get_all_movies():
    response = requests.get(f"{SERVICE_URLS['movie']}/movies")
    return jsonify(response.json()), response.status_code

@app.route('/movies/<int:movie_id>', methods=['GET'])
def get_movie(movie_id):
    response = requests.get(f"{SERVICE_URLS['movie']}/movies/{movie_id}")
    return jsonify(response.json()), response.status_code

@app.route('/movies/search', methods=['GET'])
def search_movies():
    query_params = request.args.to_dict()
    response = requests.get(f"{SERVICE_URLS['movie']}/movies/search", params=query_params)
    return jsonify(response.json()), response.status_code

@app.route('/movies/top-rated', methods=['GET'])
def get_top_rated_movies():
    response = requests.get(f"{SERVICE_URLS['movie']}/movies/top-rated")
    return jsonify(response.json()), response.status_code

@app.route('/movies/upcoming', methods=['GET'])
def get_upcoming_movies():
    response = requests.get(f"{SERVICE_URLS['movie']}/movies/upcoming")
    return jsonify(response.json()), response.status_code

# Theater Service Endpoints
@app.route('/theaters', methods=['GET'])
def get_all_theaters():
    response = requests.get(f"{SERVICE_URLS['theater']}/theaters")
    return jsonify(response.json()), response.status_code

@app.route('/theaters/<int:theater_id>', methods=['GET'])
def get_theater(theater_id):
    response = requests.get(f"{SERVICE_URLS['theater']}/theaters/{theater_id}")
    return jsonify(response.json()), response.status_code

@app.route('/theaters/location/<location>', methods=['GET'])
def get_theaters_by_location(location):
    response = requests.get(f"{SERVICE_URLS['theater']}/theaters/location/{location}")
    return jsonify(response.json()), response.status_code

@app.route('/screens/theater/<int:theater_id>', methods=['GET'])
def get_screens_by_theater(theater_id):
    response = requests.get(f"{SERVICE_URLS['theater']}/screens/theater/{theater_id}")
    return jsonify(response.json()), response.status_code

@app.route('/seats/screen/<int:screen_id>', methods=['GET'])
def get_seats_by_screen(screen_id):
    response = requests.get(f"{SERVICE_URLS['theater']}/seats/screen/{screen_id}")
    return jsonify(response.json()), response.status_code

# Schedule Service Endpoints
@app.route('/schedules', methods=['GET'])
def get_all_schedules():
    query_params = request.args.to_dict()
    response = requests.get(f"{SERVICE_URLS['schedule']}/schedules", params=query_params)
    return jsonify(response.json()), response.status_code

@app.route('/schedules/<int:schedule_id>', methods=['GET'])
def get_schedule(schedule_id):
    query_params = request.args.to_dict()
    response = requests.get(f"{SERVICE_URLS['schedule']}/schedules/{schedule_id}", params=query_params)
    return jsonify(response.json()), response.status_code

@app.route('/schedules/movie/<int:movie_id>', methods=['GET'])
def get_schedules_by_movie(movie_id):
    response = requests.get(f"{SERVICE_URLS['schedule']}/schedules/movie/{movie_id}")
    return jsonify(response.json()), response.status_code

@app.route('/schedules/theater/<int:theater_id>', methods=['GET'])
def get_schedules_by_theater(theater_id):
    response = requests.get(f"{SERVICE_URLS['schedule']}/schedules/theater/{theater_id}")
    return jsonify(response.json()), response.status_code

@app.route('/schedules/date/<date>', methods=['GET'])
def get_schedules_by_date(date):
    response = requests.get(f"{SERVICE_URLS['schedule']}/schedules/date/{date}")
    return jsonify(response.json()), response.status_code

# Booking Service Endpoints
@app.route('/bookings', methods=['POST'])
def create_booking():
    data = request.json
    response = requests.post(f"{SERVICE_URLS['booking']}/bookings", json=data)
    return jsonify(response.json()), response.status_code

@app.route('/bookings/<int:booking_id>', methods=['GET'])
def get_booking(booking_id):
    response = requests.get(f"{SERVICE_URLS['booking']}/bookings/{booking_id}")
    return jsonify(response.json()), response.status_code

@app.route('/bookings/user/<int:user_id>', methods=['GET'])
def get_user_bookings(user_id):
    response = requests.get(f"{SERVICE_URLS['booking']}/bookings/user/{user_id}")
    return jsonify(response.json()), response.status_code

@app.route('/bookings/<int:booking_id>/cancel', methods=['PUT'])
def cancel_booking(booking_id):
    response = requests.put(f"{SERVICE_URLS['booking']}/bookings/{booking_id}/cancel")
    return jsonify(response.json()), response.status_code

@app.route('/bookings/check-seats', methods=['GET'])
def check_seats_availability():
    query_params = request.args.to_dict()
    response = requests.get(f"{SERVICE_URLS['booking']}/bookings/check-seats", params=query_params)
    return jsonify(response.json()), response.status_code

# Payment Service Endpoints
@app.route('/payments', methods=['POST'])
def process_payment():
    data = request.json
    response = requests.post(f"{SERVICE_URLS['payment']}/payments", json=data)
    return jsonify(response.json()), response.status_code

@app.route('/payments/<int:payment_id>', methods=['GET'])
def get_payment(payment_id):
    response = requests.get(f"{SERVICE_URLS['payment']}/payments/{payment_id}")
    return jsonify(response.json()), response.status_code

@app.route('/payments/booking/<int:booking_id>', methods=['GET'])
def get_payment_by_booking(booking_id):
    response = requests.get(f"{SERVICE_URLS['payment']}/payments/booking/{booking_id}")
    return jsonify(response.json()), response.status_code

@app.route('/payments/<int:payment_id>/verify', methods=['POST'])
def verify_payment(payment_id):
    data = request.json
    response = requests.post(f"{SERVICE_URLS['payment']}/payments/{payment_id}/verify", json=data)
    return jsonify(response.json()), response.status_code

@app.route('/payments/<int:payment_id>/invoice', methods=['GET'])
def get_invoice(payment_id):
    response = requests.get(f"{SERVICE_URLS['payment']}/payments/{payment_id}/invoice")
    return jsonify(response.json()), response.status_code

# Notification Service Endpoints
@app.route('/notifications', methods=['POST'])
def send_notification():
    data = request.json
    response = requests.post(f"{SERVICE_URLS['notification']}/notifications", json=data)
    return jsonify(response.json()), response.status_code

@app.route('/notifications/user/<int:user_id>', methods=['GET'])
def get_user_notifications(user_id):
    response = requests.get(f"{SERVICE_URLS['notification']}/notifications/user/{user_id}")
    return jsonify(response.json()), response.status_code

@app.route('/notifications/send-push', methods=['POST'])
def send_push_notification():
    data = request.json
    response = requests.post(f"{SERVICE_URLS['notification']}/notifications/send-push", json=data)
    return jsonify(response.json()), response.status_code

@app.route('/notifications/<int:notification_id>/read', methods=['PUT'])
def mark_notification_read(notification_id):
    response = requests.put(f"{SERVICE_URLS['notification']}/notifications/{notification_id}/read")
    return jsonify(response.json()), response.status_code

# Recommendation Service Endpoints
@app.route('/recommendations/user/<int:user_id>', methods=['GET'])
def get_user_recommendations(user_id):
    response = requests.get(f"{SERVICE_URLS['recommendation']}/recommendations/user/{user_id}")
    return jsonify(response.json()), response.status_code

@app.route('/recommendations/similar/<int:movie_id>', methods=['GET'])
def get_similar_movies(movie_id):
    response = requests.get(f"{SERVICE_URLS['recommendation']}/recommendations/similar/{movie_id}")
    return jsonify(response.json()), response.status_code

@app.route('/recommendations/trending', methods=['GET'])
def get_trending_movies():
    response = requests.get(f"{SERVICE_URLS['recommendation']}/recommendations/trending")
    return jsonify(response.json()), response.status_code

@app.route('/recommendations/interaction', methods=['POST'])
def track_user_interaction():
    data = request.json
    response = requests.post(f"{SERVICE_URLS['recommendation']}/recommendations/interaction", json=data)
    return jsonify(response.json()), response.status_code

# Composite Endpoints (Combining multiple services)
@app.route('/movie-details/<int:movie_id>', methods=['GET'])
def get_movie_details(movie_id):
    try:
        # Get movie info
        movie_response = requests.get(f"{SERVICE_URLS['movie']}/movies/{movie_id}")
        movie_data = movie_response.json()
        
        # Get schedules for this movie
        schedules_response = requests.get(f"{SERVICE_URLS['schedule']}/schedules/movie/{movie_id}")
        schedules_data = schedules_response.json()
        
        # Get similar movies
        similar_response = requests.get(f"{SERVICE_URLS['recommendation']}/recommendations/similar/{movie_id}")
        similar_data = similar_response.json() if similar_response.status_code == 200 else []
        
        # Combine data
        result = {
            "movie": movie_data,
            "schedules": schedules_data,
            "similar_movies": similar_data
        }
        
        return jsonify(result)
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500

@app.route('/user-profile/<int:user_id>', methods=['GET'])
def get_user_profile(user_id):
    try:
        # Get user info
        user_response = requests.get(f"{SERVICE_URLS['user']}/users/{user_id}")
        user_data = user_response.json()
        
        # Get user bookings
        bookings_response = requests.get(f"{SERVICE_URLS['booking']}/bookings/user/{user_id}")
        bookings_data = bookings_response.json() if bookings_response.status_code == 200 else []
        
        # Get user recommendations
        recommendations_response = requests.get(f"{SERVICE_URLS['recommendation']}/recommendations/user/{user_id}")
        recommendations_data = recommendations_response.json() if recommendations_response.status_code == 200 else []
        
        # Get user notifications
        notifications_response = requests.get(f"{SERVICE_URLS['notification']}/notifications/user/{user_id}")
        notifications_data = notifications_response.json() if notifications_response.status_code == 200 else []
        
        # Combine data
        result = {
            "user": user_data,
            "bookings": bookings_data,
            "recommendations": recommendations_data,
            "notifications": notifications_data
        }
        
        return jsonify(result)
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)