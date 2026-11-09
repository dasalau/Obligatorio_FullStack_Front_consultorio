import GroqForm from "../../components/groq/GroqForm";
import GroqDisplay from "../../components/groq/GroqDisplay";

const GroqPage = () => {
  return (
    <div className="d-grid gap-3">
      <GroqForm />
      <GroqDisplay />
    </div>
  );
};

export default GroqPage;
