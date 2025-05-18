import { toast } from "sonner";

export const toastValidationErrors = (validation) => {
    const errorMessages = Object.values(validation.error.flatten().fieldErrors)
                  .flat()
                  .filter(Boolean);

    toast.error((
            <div>
                {errorMessages.map((message, idx) => (
                    <p key={idx} className="text-xs">{message}</p>
                ))}
            </div>
    ));
}