'use strict';


const { BadRequestError, NotFoundError } = require('../core/error.response');
const { createInvoice, insertListInvoiceDetail, getAllInvoice, getInvoiceUser, getInvoiceById, updateInoiceStatus, updateDestroyInvoice } = require('../models/repositories/invoice.repo');
const { findUserById } = require('./user.service');


class PaymentService {
    static pay = async (paymentData) => {
        const { id_user, total_price, id_address, notes, listDrugCart,
            id_paypal
        } = paymentData;

        if (!id_user || !total_price || !id_address || !listDrugCart) {
            throw new BadRequestError('Missing required payment data');
        }


        if (!Array.isArray(listDrugCart)) {
            throw new BadRequestError('listDrugCart must be an array');
        }

        const currentDate = new Date().toLocaleString();

        try {
            const invoice = await createInvoice({
                id_user,
                create_date: currentDate,
                total_price,
                status: false,
                notes: "Payment successfully!",
                id_address,
                id_paypal

            });

            await insertListInvoiceDetail({
                listDrugCart,
                id_invoice: invoice.id_invoice,

            });

            return {
                success: true,
                invoice,
                id_invoice: invoice.id_invoice,
            };
        } catch (error) {
            console.error('Error creating invoice or inserting invoice details:', error);

            throw new BadRequestError('Payment initiation failed. Please try again later.');
        }
    }


    static getAllInvoiceOfUser = async (id_user) => {

        const foundUser = await findUserById(id_user)

        if (!foundUser) {
            throw NotFoundError('User not found!')
        }

        return await getAllInvoice(id_user)
    }


    static getOrderUser = async (id_user) => {
        const foundUser = await findUserById(id_user)
        if (!foundUser) {
            throw new NotFoundError('User not found!')
        }
        return await getInvoiceUser(foundUser.id_user)
    }

    static getInvoiceById = async (id_invoice) => {
        return await getInvoiceById(id_invoice)
    }


    static updateInvoice = async ({ id_invoice }) => {
        return await updateInoiceStatus(id_invoice)
    }

    static updateDestroyInvoiceFunc = async ({ id_invoice }) => {
        return await updateDestroyInvoice(id_invoice)
    }
}


module.exports = PaymentService;