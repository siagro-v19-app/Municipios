sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], function(Controller, JSONModel, MessageBox) {
	"use strict";

	return Controller.extend("br.com.idxtecMunicipios.controller.Municipios", {
		onInit: function(){
			var oJSONModel = new JSONModel();
			
			this._operacao = null;
			this._sPath = null;

			this.getOwnerComponent().setModel(oJSONModel, "model");
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		},
		
		onRefresh: function(e){
			var oModel = this.getOwnerComponent().getModel();
			oModel.refresh(true);
		},
		
		onIncluir: function(){
			var oDialog = this._criarDialog();
			var oTable = this.byId("tableMunicipios");
			var oJSONModel = this.getOwnerComponent().getModel("model");
			
			this._operacao = "incluir";
			
			oDialog.setEscapeHandler(function(oPromise){
				if(oJSONModel.hasPendingChanges()){
					oJSONModel.resetChanges();
				}
			});
			
			var oNovoMunicipio = {
				"Id": 0,
				"Codigo": "",
				"Nome": "",
				"Uf": 0
			};
			
			oJSONModel.setData(oNovoMunicipio);
			this.getView().byId("uf").setSelectedKey("");
			
			oTable.clearSelection();
			oDialog.open();
		},
		
		onEditar: function(){
			var oDialog = this._criarDialog();
			var oTable = this.byId("tableMunicipios");
			var nIndex = oTable.getSelectedIndex();
			var oModel = this.getOwnerComponent().getModel();
			var oJSONModel = this.getOwnerComponent().getModel("model");
			
			this._operacao = "editar";
			
			if(nIndex === -1){
				MessageBox.information("Selecione um município da tabela!");
				return;
			}
			
			var oContext = oTable.getContextByIndex(nIndex);
			this._sPath = oContext.sPath;
			
			oModel.read(oContext.sPath, {
				success: function(oData){
					oJSONModel.setData(oData);
				},
				error: function(oError){
					MessageBox.error(oError.responseText);
				}
			});
			
			oTable.clearSelection();
			oDialog.open();
		},
		
		onRemover: function(){
			var that = this;
			var oTable = this.byId("tableMunicipios");
			var nIndex = oTable.getSelectedIndex();
			
			if(nIndex === -1){
				MessageBox.information("Selecione um município da tabela!");
				return;
			}
			
			MessageBox.confirm("Deseja remover esse município?", {
				onClose: function(sResposta){
					if(sResposta === "OK"){
						MessageBox.success("Município removido com sucesso!");
						that._remover(oTable, nIndex);
					} 
				}      
			});
		},
		
		_remover: function(oTable, nIndex){
			var oModel = this.getOwnerComponent().getModel();
			var oContext = oTable.getContextByIndex(nIndex);
			
			oModel.remove(oContext.sPath,{
				success: function(){
					oModel.refresh(true);
					oTable.clearSelection();
				},
				error: function(oError){
					MessageBox.error(oError.responseText);
				}
			});
		},
		
		onSaveDialog: function(){
			if (this._checarCampos(this.getView())) {
				MessageBox.information("Preencha todos os campos obrigatórios!");
				return;
			}
			if(this._operacao === "incluir"){
				this._createMunicipio();
				this.getView().byId("MunicipiosDialog").close();
			} else if(this._operacao === "editar"){
				this._updateMunicipio();
				this.getView().byId("MunicipiosDialog").close();
			} 
		},
		
		onCloseDialog: function(){
			var oModel = this.getOwnerComponent().getModel();
			
			if(oModel.hasPendingChanges()){
				oModel.resetChanges();
			}
			
			this.byId("MunicipiosDialog").close();
		},
		
		_createMunicipio: function(){
			var oModel = this.getOwnerComponent().getModel();
			var oJSONModel = this.getOwnerComponent().getModel("model");
			
			var oDados = oJSONModel.getData();
			
			oDados.Uf = parseInt(oDados.Uf, 0);
			oDados.UfDetails = {
				__metadata: {
					uri: "/Ufs(" + oDados.Uf + ")"
				}
			};
			oModel.create("/Municipios", oDados, {
				success: function() {
					MessageBox.success("Dados gravados.");
					oModel.refresh(true);
				},
				error: function(oError) {
					MessageBox.error(oError.responseText);
				}
			});
		},
		
		_updateMunicipio: function(){
			var oModel = this.getOwnerComponent().getModel();
			var oJSONModel = this.getOwnerComponent().getModel("model");
			
			var oDados = oJSONModel.getData();
			
			oDados.Uf = parseInt(oDados.Uf, 0);
			oDados.UfDetails = {
				__metadata:{
					uri: "/Ufs(" + oDados.Uf + ")"
				}
			};
			
			oModel.update(this._sPath, oDados, {
				success: function(){
					MessageBox.success("Dados gravados.");
					oModel.refresh(true);
				},
				error: function(oError){
					MessageBox.error(oError.responseText);
				}
			});
		},
		
		_criarDialog: function(){
			var oView = this.getView();
			var oDialog = this.byId("MunicipiosDialog"); 
			
			if(!oDialog){
				oDialog = sap.ui.xmlfragment(oView.getId(), "br.com.idxtecMunicipios.view.MunicipiosDialog", this);
				oView.addDependent(oDialog);
			}
			
			return oDialog;
		},
		
		_checarCampos: function(oView){
			if(oView.byId("codigo").getValue() === "" || oView.byId("nome").getValue() === ""
			|| oView.byId("uf").getSelectedItem() === null){
				return true;
			} else{
				return false; 
			}
		}
	});
});