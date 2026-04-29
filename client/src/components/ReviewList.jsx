export default function ReviewsList({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return <p>No reviews yet.</p>;
  }

  return (
    <div>
      {reviews.map((review) => (
        <div key={review._id}>
          <div>
            <strong>{review.user?.firstName} {review.user?.lastName}</strong>
            <span> • {review.rating} stars</span>
          </div>
          <p>{review.comment}</p>
          {review.photoUrl && <img src={review.photoUrl} alt="Review" />}
          <small>{new Date(review.createdAt).toLocaleDateString()}</small>
        </div>
      ))}
    </div>
  );
}