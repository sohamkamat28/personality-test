import { WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { site } from "@/data/site";

export default function WhatsAppFloat() {
  const message = encodeURIComponent("Hi! I have a question about Bean Theory Coffee.");

  return (
    <a
      className="whatsapp-float"
      href={`https://wa.me/${site.phoneHref.replace("+", "")}?text=${message}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with Bean Theory Coffee on WhatsApp"
    >
      <WhatsappLogo size={30} weight="fill" />
    </a>
  );
}
