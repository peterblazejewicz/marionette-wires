describe('flashes/service', function() {
  beforeEach(function() {
    this.collection = { findWhere: stub(), add: stub() };
    this.collectionView = { collectionView: true };

    this.Collection     = stub().returns(this.collection);
    this.CollectionView = stub().returns(this.collectionView);

    this.container = { show: stub() };

    this.Service = proxyquire('../../src/flashes/service.js', {
      './collection'      : this.Collection,
      './collection-view' : this.CollectionView
    });

    this.service = new this.Service({ container: this.container });
  });

  describe('#initialize', function() {
    beforeEach(function() {
      stub(this.service, 'start');
      this.service.initialize({ container: this.container });
    });

    it('should attach container', function() {
      expect(this.service).to.have.ownProperty('container', this.container);
    });

    it('should create a collection', function() {
      expect(this.Collection).to.have.been.calledWithNew;
      expect(this.service).to.have.property('collection', this.collection);
    });

    it('should call "start"', function() {
      expect(this.service.start).to.have.been.called;
    });
  });

  describe('#onStart', function() {
    beforeEach(function() {
      this.service.onStart();
    });

    it('should create a CollectionView', function() {
      expect(this.CollectionView).to.have.been.calledWithNew.and.calledWith({
        collection: this.collection
      });
    });

    it('should show the CollectionView', function() {
      expect(this.container.show).to.have.been.calledWith(this.collectionView);
    });
  });

  describe('#onStop', function() {
    beforeEach(function() {
      this.flashesChannel = Backbone.Radio.channel('flashes');
      stub(this.flashesChannel, 'stopComplying');
      this.service.onStop();
    });

    it('should clear the commands on the channel', function() {
      expect(this.flashesChannel.stopComplying).to.have.been.called;
    });
  });

  describe('#add', function() {
    beforeEach(function() {
      this.flash = { flash: true };
      this.service.add(this.flash);
    });

    it('should add the flash to the collection', function() {
      expect(this.collection.add).to.have.been.calledWith(this.flash);
    });
  });

  describe('#remove', function() {
    describe('when model exists', function() {
      beforeEach(function() {
        this.model = { destroy: stub() };
        this.collection.findWhere.returns(this.model);
        this.service.remove();
      });

      it('should destroy the model', function() {
        expect(this.model.destroy).to.have.been.called;
      });
    });

    describe('when model does not exist', function() {
      beforeEach(function() {
        spy(Backbone.Model.prototype, 'destroy');
        this.collection.findWhere.returns(undefined);
        this.service.remove();
      });

      it('should not destroy anything', function() {
        expect(Backbone.Model.prototype.destroy).not.to.have.been.called;
      });
    });
  });
});
