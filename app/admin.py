from flask import Flask, request, jsonify, render_template, redirect, url_for
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


@app.route('/')
@app.route('/admin')
def admin_dashboard():
    return render_template('main.html')

@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    response = requests.get(f"{SERVICE_URLS['user']}/users/{user_id}")
    return jsonify(response.json()), response.status_code

# Movie Service Endpoints
@app.route('/api/movies', methods=['GET'])
def get_all_movies():
    response = requests.get(f"{SERVICE_URLS['movie']}/movies")
    return jsonify(response.json()), response.status_code

@app.route('/api/apimovies/<int:movie_id>', methods=['GET'])
def get_movie(movie_id):
    response = requests.get(f"{SERVICE_URLS['movie']}/movies/{movie_id}")
    return jsonify(response.json()), response.status_code

@app.route('/api/movies/search', methods=['GET'])
def search_movies():
    query_params = request.args.to_dict()
    response = requests.get(f"{SERVICE_URLS['movie']}/movies/search", params=query_params)
    return jsonify(response.json()), response.status_code

@app.route('/api/movies/top-rated', methods=['GET'])
def get_top_rated_movies():
    response = requests.get(f"{SERVICE_URLS['movie']}/movies/top-rated")
    return jsonify(response.json()), response.status_code

@app.route('/api/movies/upcoming', methods=['GET'])
def get_upcoming_movies():
    response = requests.get(f"{SERVICE_URLS['movie']}/movies/upcoming")
    return jsonify(response.json()), response.status_code

# Add route to show the theaters admin page
@app.route('/admin/theaters')
def theaters_admin():
    return render_template('theaters_admin.html')

# Theater Management Endpoints
@app.route('/api/theaters', methods=['POST'])
def create_theater():
    data = request.json
    response = requests.post(f"{SERVICE_URLS['theater']}/theaters", json=data)
    return jsonify(response.json()), response.status_code

@app.route('/api/theaters/<int:theater_id>', methods=['PUT'])
def update_theater(theater_id):
    data = request.json
    response = requests.put(f"{SERVICE_URLS['theater']}/theaters/{theater_id}", json=data)
    return jsonify(response.json()), response.status_code

@app.route('/api/theaters/<int:theater_id>', methods=['DELETE'])
def delete_theater(theater_id):
    response = requests.delete(f"{SERVICE_URLS['theater']}/theaters/{theater_id}")
    return jsonify(response.json()), response.status_code

# Screen Management Endpoints
@app.route('/api/screens', methods=['GET'])
def get_all_screens():
    response = requests.get(f"{SERVICE_URLS['theater']}/screens")
    return jsonify(response.json()), response.status_code

@app.route('/api/screens', methods=['POST'])
def create_screen():
    data = request.json
    response = requests.post(f"{SERVICE_URLS['theater']}/screens", json=data)
    return jsonify(response.json()), response.status_code

@app.route('/api/screens/<int:screen_id>', methods=['GET'])
def get_screen(screen_id):
    response = requests.get(f"{SERVICE_URLS['theater']}/screens/{screen_id}")
    return jsonify(response.json()), response.status_code

@app.route('/api/screens/<int:screen_id>', methods=['PUT'])
def update_screen(screen_id):
    data = request.json
    response = requests.put(f"{SERVICE_URLS['theater']}/screens/{screen_id}", json=data)
    return jsonify(response.json()), response.status_code

@app.route('/api/screens/<int:screen_id>', methods=['DELETE'])
def delete_screen(screen_id):
    response = requests.delete(f"{SERVICE_URLS['theater']}/screens/{screen_id}")
    return jsonify(response.json()), response.status_code

# Seat Management Endpoints
@app.route('/api/seats', methods=['POST'])
def create_seats():
    data = request.json
    response = requests.post(f"{SERVICE_URLS['theater']}/seats", json=data)
    return jsonify(response.json()), response.status_code

@app.route('/api/seats/bulk', methods=['POST'])
def create_bulk_seats():
    data = request.json
    response = requests.post(f"{SERVICE_URLS['theater']}/seats/bulk", json=data)
    return jsonify(response.json()), response.status_code

@app.route('/api/seats/screen/<int:screen_id>/delete', methods=['DELETE'])
def delete_seats_by_screen(screen_id):
    response = requests.delete(f"{SERVICE_URLS['theater']}/seats/screen/{screen_id}")
    return jsonify(response.json()), response.status_code

# Payment Service Endpoints
@app.route('/api/payments', methods=['POST'])
def process_payment():
    data = request.json
    response = requests.post(f"{SERVICE_URLS['payment']}/payments", json=data)
    return jsonify(response.json()), response.status_code

@app.route('/api/payments/<int:payment_id>', methods=['GET'])
def get_payment(payment_id):
    response = requests.get(f"{SERVICE_URLS['payment']}/payments/{payment_id}")
    return jsonify(response.json()), response.status_code

@app.route('/api/payments/booking/<int:booking_id>', methods=['GET'])
def get_payment_by_booking(booking_id):
    response = requests.get(f"{SERVICE_URLS['payment']}/payments/booking/{booking_id}")
    return jsonify(response.json()), response.status_code

@app.route('/api/payments/<int:payment_id>/verify', methods=['POST'])
def verify_payment(payment_id):
    data = request.json
    response = requests.post(f"{SERVICE_URLS['payment']}/payments/{payment_id}/verify", json=data)
    return jsonify(response.json()), response.status_code

@app.route('/api/payments/<int:payment_id>/invoice', methods=['GET'])
def get_invoice(payment_id):
    response = requests.get(f"{SERVICE_URLS['payment']}/payments/{payment_id}/invoice")
    return jsonify(response.json()), response.status_code

# Notification Service Endpoints
@app.route('/api/notifications', methods=['POST'])
def send_notification():
    data = request.json
    response = requests.post(f"{SERVICE_URLS['notification']}/notifications", json=data)
    return jsonify(response.json()), response.status_code

@app.route('/api/notifications/user/<int:user_id>', methods=['GET'])
def get_user_notifications(user_id):
    response = requests.get(f"{SERVICE_URLS['notification']}/notifications/user/{user_id}")
    return jsonify(response.json()), response.status_code

@app.route('/api/notifications/send-push', methods=['POST'])
def send_push_notification():
    data = request.json
    response = requests.post(f"{SERVICE_URLS['notification']}/notifications/send-push", json=data)
    return jsonify(response.json()), response.status_code

@app.route('/api/notifications/<int:notification_id>/read', methods=['PUT'])
def mark_notification_read(notification_id):
    response = requests.put(f"{SERVICE_URLS['notification']}/notifications/{notification_id}/read")
    return jsonify(response.json()), response.status_code

# Recommendation Service Endpoints
@app.route('/api/recommendations/user/<int:user_id>', methods=['GET'])
def get_user_recommendations(user_id):
    response = requests.get(f"{SERVICE_URLS['recommendation']}/recommendations/user/{user_id}")
    return jsonify(response.json()), response.status_code

@app.route('/api/recommendations/similar/<int:movie_id>', methods=['GET'])
def get_similar_movies(movie_id):
    response = requests.get(f"{SERVICE_URLS['recommendation']}/recommendations/similar/{movie_id}")
    return jsonify(response.json()), response.status_code

@app.route('/api/recommendations/trending', methods=['GET'])
def get_trending_movies():
    response = requests.get(f"{SERVICE_URLS['recommendation']}/recommendations/trending")
    return jsonify(response.json()), response.status_code

@app.route('/api/recommendations/interaction', methods=['POST'])
def track_user_interaction():
    data = request.json
    response = requests.post(f"{SERVICE_URLS['recommendation']}/recommendations/interaction", json=data)
    return jsonify(response.json()), response.status_code

# Composite Endpoints (Combining multiple services)
@app.route('/api/movie-details/<int:movie_id>', methods=['GET'])
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

@app.route('/api/user-profile/<int:user_id>', methods=['GET'])
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