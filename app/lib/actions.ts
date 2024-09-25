'use server'
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';


// Creates a schema using the zod library to help in validation and casting of formdata
const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
      invalid_type_error: 'Please select a customer',
    }),
    // coerce validates and casts to a number
    amount: z.coerce
      .number()
      .gt(0, { message: 'Please enter an amount greater than $0.'}),
    status: z.enum(['pending', 'paid'], {
      invalid_type_error: 'Please select an invoice status.',
    }),
    date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
    //safeParse() will return an object containing either a success or error 
    // field. This will help handle validation more gracefully 
    // without having put this logic inside the try/catch block.
    const validatedFields = CreateInvoice.safeParse({
      customerId: formData.get('customerId'),
      amount:     formData.get('amount'),
      status:     formData.get('status'),
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Create Invoice.',
      };
    }

      // If form validation fails, return errors early. Otherwise, continue.
      console.log(`Validated Fileds: ${validatedFields}`);
      const { customerId, amount, status } = validatedFields.data;
      
    // Storing monetary amounts in cents to 
    // eliminate JavaScript floating-point errors and ensure greater accuracy.
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];
   
    try {
      await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
      `;
    } catch (error) {
      return {
        message: `Database Error: ${error} // Failed to Create Invoice.`,
      };
    }
   
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
  }

const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(id: string, prevState: State, formData: FormData) {
  // const { customerId, amount, status } = UpdateInvoice.parse({
  //   customerId: formData.get('customerId'),
  //   amount: formData.get('amount'),
  //   status: formData.get('status'),
  // });

  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount:     formData.get('amount'),
    status:     formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice',
    };
  }

  const { customerId, amount, status } = validatedFields.data;

  const amountInCents = amount * 100;
   try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
   } catch (error) {
    return { messsage: `Database Error: ${error} // Failed to Update Invoice` }
   }

   
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
  }


  export async function deleteInvoice(id: string) {
    //throw new Error("delete, i can not");
    try {
      await sql`DELETE FROM invoices WHERE id = ${id}`;
      revalidatePath('/dashboard/invoices');
      return { message: 'Deleted Invoice.' };
    } catch (error) {
      return { message: `Database Error: ${error} // Failed to Delete Invoice.` };
    }
}